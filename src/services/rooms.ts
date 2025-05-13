import { supabase } from "@/integrations/supabase/client";
import type { Profile, Room } from "@/lib/types";

interface RoomResponse {
  room: Room | null;
  error: string | null;
}

interface Response {
  success: boolean;
  error: string | null;
}

export const createRoom = async (
  name: string,
  description: string = "",
  isPrivate: boolean = false
): Promise<RoomResponse> => {
  try {
    // Input validation
    if (!name?.trim()) {
      return { room: null, error: "Room name is required" };
    }

    if (name.length > 100) {
      return {
        room: null,
        error: "Room name must be less than 100 characters",
      };
    }

    // Get the current user data
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return { room: null, error: "Authentication required" };
    }

    // First, create the room
    const { data, error } = await supabase
      .from("rooms")
      .insert({
        name: name.trim(),
        description: description?.trim() || "",
        is_private: isPrivate,
        created_by: userData.user.id,
      })
      .select()
      .single();

    if (error) {
      return { room: null, error: `Failed to create room: ${error.message}` };
    }

    // Now try to add the member with a separate request
    const { error: memberError } = await supabase.from("room_members").insert({
      room_id: data.id,
      user_id: userData.user.id,
    });

    if (memberError) {
      // Log the error but don't fail the operation since the room was created
      console.error("Error adding creator as room member:", memberError);
    }

    return { room: data, error: null };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error creating room:", errorMessage);
    return { room: null, error: errorMessage };
  }
};

export const getRooms = async (): Promise<Room[]> => {
  try {
    // Get the current user to check if they're logged in
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      throw new Error("User must be logged in to get rooms");
    }

    // First, get all rooms the user is a member of
    const { data: memberRooms, error: memberError } = await supabase
      .from("room_members")
      .select("room_id")
      .eq("user_id", userData.user.id);

    if (memberError) {
      console.error("Error getting room memberships:", memberError);
      return [];
    }

    // Get all public rooms
    const { data: publicRooms, error: publicError } = await supabase
      .from("rooms")
      .select("*")
      .eq("is_private", false);

    if (publicError) {
      console.error("Error getting public rooms:", publicError);
      return [];
    }

    // If the user is a member of any rooms, get those rooms too
    let memberRoomsData: Room[] = [];
    if (memberRooms && memberRooms.length > 0) {
      const roomIds = memberRooms.map((member) => member.room_id);

      const { data: rooms, error: roomsError } = await supabase
        .from("rooms")
        .select("*")
        .in("id", roomIds);

      if (roomsError) {
        console.error("Error getting member rooms:", roomsError);
      } else {
        memberRoomsData = rooms || [];
      }
    }

    // Combine public and member rooms, removing duplicates
    const allRooms = [...(publicRooms || [])];

    // Add member rooms that aren't already in the list (private rooms)
    memberRoomsData.forEach((room) => {
      if (!allRooms.some((r) => r.id === room.id)) {
        allRooms.push(room);
      }
    });

    // Sort by created_at
    return allRooms.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch (error) {
    console.error("Error getting rooms:", error);
    return [];
  }
};

interface GetRoomResponse {
  room: Room | null;
  error: string | null;
  status:
    | "public"
    | "private-member"
    | "private-creator"
    | "not-found"
    | "error";
}

export const getRoom = async (roomId: string): Promise<GetRoomResponse> => {
  try {
    // Input validation
    if (!roomId?.trim()) {
      return {
        room: null,
        error: "Room ID is required",
        status: "error",
      };
    }

    // Get the current user to check if they're logged in
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return {
        room: null,
        error: "Authentication required",
        status: "error",
      };
    }

    // First check if the room is public
    const { data: publicRoom, error: publicError } = await supabase
      .from("rooms")
      .select("*")
      .eq("id", roomId)
      .eq("is_private", false)
      .single();

    if (!publicError && publicRoom) {
      return {
        room: publicRoom,
        error: null,
        status: "public",
      };
    }

    // If not public, check if the user is a member
    const { error: membershipError } = await supabase
      .from("room_members")
      .select("room_id")
      .eq("room_id", roomId)
      .eq("user_id", userData.user.id)
      .single();

    if (!membershipError) {
      // User is a member, get the room details
      const { data: memberRoom, error: roomError } = await supabase
        .from("rooms")
        .select("*")
        .eq("id", roomId)
        .single();

      if (!roomError && memberRoom) {
        return {
          room: memberRoom,
          error: null,
          status: "private-member",
        };
      }
    }

    // Check if it's a private room created by the user
    const { data: userRoom, error: userError } = await supabase
      .from("rooms")
      .select("*")
      .eq("id", roomId)
      .eq("created_by", userData.user.id)
      .single();

    if (!userError && userRoom) {
      return {
        room: userRoom,
        error: null,
        status: "private-creator",
      };
    }

    // If all attempts fail, return not found
    return {
      room: null,
      error: "Room not found or you don't have access",
      status: "not-found",
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error(`Error getting room ${roomId}:`, errorMessage);
    return {
      room: null,
      error: errorMessage,
      status: "error",
    };
  }
};

export const joinRoom = async (roomId: string): Promise<Response> => {
  try {
    // Input validation
    if (!roomId?.trim()) {
      return { success: false, error: "Room ID is required" };
    }

    // Get the current user
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return { success: false, error: "Authentication required" };
    }

    // Check if room exists and get its privacy status
    const { data: roomData, error: roomError } = await supabase
      .from("rooms")
      .select("is_private")
      .eq("id", roomId)
      .single();

    if (roomError) {
      return { success: false, error: "Room not found" };
    }

    // For private rooms, check if user has permission to join
    if (roomData.is_private) {
      const { data: creatorCheck } = await supabase
        .from("rooms")
        .select("id")
        .eq("id", roomId)
        .eq("created_by", userData.user.id)
        .single();

      if (!creatorCheck) {
        return {
          success: false,
          error: "This is a private room. You need an invitation to join.",
        };
      }
    }

    // Check if user is already a member
    const { data: existingMember, error: memberCheckError } = await supabase
      .from("room_members")
      .select("id")
      .eq("room_id", roomId)
      .eq("user_id", userData.user.id)
      .single();

    if (!memberCheckError && existingMember) {
      return { success: false, error: "Already a member of this room" };
    }

    // Add user to room
    const { error } = await supabase.from("room_members").insert({
      room_id: roomId,
      user_id: userData.user.id,
    });

    if (error) {
      return { success: false, error: `Failed to join room: ${error.message}` };
    }

    return { success: true, error: null };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error(`Error joining room ${roomId}:`, errorMessage);
    return { success: false, error: errorMessage };
  }
};

export const leaveRoom = async (roomId: string): Promise<Response> => {
  try {
    // Input validation
    if (!roomId?.trim()) {
      return { success: false, error: "Room ID is required" };
    }

    // Get the current user
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return { success: false, error: "Authentication required" };
    }

    // Check if user is a member
    const { data: member, error: memberCheckError } = await supabase
      .from("room_members")
      .select("id")
      .eq("room_id", roomId)
      .eq("user_id", userData.user.id)
      .single();

    if (memberCheckError || !member) {
      return { success: false, error: "You are not a member of this room" };
    }

    // Remove user from room
    const { error } = await supabase
      .from("room_members")
      .delete()
      .eq("room_id", roomId)
      .eq("user_id", userData.user.id);

    if (error) {
      return {
        success: false,
        error: `Failed to leave room: ${error.message}`,
      };
    }

    return { success: true, error: null };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error(`Error leaving room ${roomId}:`, errorMessage);
    return { success: false, error: errorMessage };
  }
};

interface GetRoomMembersResponse {
  members: Profile[];
  error: string | null;
  hasMore: boolean;
}

export const getRoomMembers = async (
  roomId: string,
  page: number = 1,
  limit: number = 50
): Promise<GetRoomMembersResponse> => {
  try {
    // Input validation
    if (!roomId?.trim()) {
      return { members: [], error: "Room ID is required", hasMore: false };
    }

    if (page < 1) {
      return { members: [], error: "Invalid page number", hasMore: false };
    }

    // Get the current user to check if they're logged in
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return { members: [], error: "Authentication required", hasMore: false };
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // First check if the room exists and get its privacy status
    const { data: roomData, error: roomError } = await supabase
      .from("rooms")
      .select("is_private")
      .eq("id", roomId)
      .single();

    if (roomError) {
      return {
        members: [],
        error: "Room not found",
        hasMore: false,
      };
    }

    // For private rooms, check if user is a member or creator
    if (roomData.is_private) {
      // Check if user is the creator
      const { data: creatorRoom } = await supabase
        .from("rooms")
        .select("id")
        .eq("id", roomId)
        .eq("created_by", userData.user.id)
        .single();

      if (!creatorRoom) {
        // If not creator, check if user is a member
        const { error: membershipError } = await supabase
          .from("room_members")
          .select("id")
          .eq("room_id", roomId)
          .eq("user_id", userData.user.id)
          .single();

        if (membershipError) {
          return {
            members: [],
            error: "You don't have permission to view members of this room",
            hasMore: false,
          };
        }
      }
    }

    // Get total count of members for pagination
    const { count: totalMembers } = await supabase
      .from("room_members")
      .select("*", { count: "exact", head: true })
      .eq("room_id", roomId);

    // Now get the members with pagination
    const { data: memberData, error: memberError } = await supabase
      .from("room_members")
      .select("user_id")
      .eq("room_id", roomId)
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (memberError) {
      return {
        members: [],
        error: `Failed to fetch room members: ${memberError.message}`,
        hasMore: false,
      };
    }

    if (!memberData || memberData.length === 0) {
      return { members: [], error: null, hasMore: false };
    }

    // Get user profiles for the members
    const userIds = memberData.map((member) => member.user_id);
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .in("id", userIds);

    if (profileError) {
      return {
        members: [],
        error: `Failed to fetch member profiles: ${profileError.message}`,
        hasMore: false,
      };
    }

    // Check if there are more results
    const hasMore = totalMembers ? offset + limit < totalMembers : false;

    return {
      members: profiles || [],
      error: null,
      hasMore,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error(`Error getting members for room ${roomId}:`, errorMessage);
    return {
      members: [],
      error: errorMessage,
      hasMore: false,
    };
  }
};
