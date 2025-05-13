import { supabase } from "@/integrations/supabase/client";
import type { Profile, Room } from "@/lib/types";

export const createRoom = async (
  name: string,
  description: string = "",
  isPrivate: boolean = false
): Promise<Room | null> => {
  try {
    // get the current user data
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      throw new Error("User must be logged in to create a room");
    }

    const { data, error } = await supabase
      .from("rooms")
      .insert({
        name,
        description,
        is_private: isPrivate,
        created_by: userData.user.id,
      })
      .select()
      .single();

    if (error) throw error;

    // automatically join the room after creating it
    await joinRoom(data.id);

    return data;
  } catch (error) {
    console.error("Error creating room", error);
    return null;
  }
};

export const getRooms = async (): Promise<Room[]> => {
  try {
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting rooms:", error);
    return [];
  }
};

export const getRoom = async (roomId: string): Promise<Room | null> => {
  try {
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .eq("id", roomId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error getting room ${roomId}:`, error);
    return null;
  }
};

export const joinRoom = async (roomId: string): Promise<boolean> => {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error("User must be logged in to join a room");

    const { error } = await supabase.from("room_members").insert({
      room_id: roomId,
      user_id: user.id,
    });

    if (error) {
      // If the error is because the user is already a member, that's okay
      if (error.code === "23505") {
        // Unique violation
        return true;
      }
      throw error;
    }

    return true;
  } catch (error) {
    console.error(`Error joining room ${roomId}:`, error);
    return false;
  }
};

export const leaveRoom = async (roomId: string): Promise<boolean> => {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error("User must be logged in to leave a room");

    const { error } = await supabase
      .from("room_members")
      .delete()
      .eq("room_id", roomId)
      .eq("user_id", user.id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error leaving room ${roomId}:`, error);
    return false;
  }
};

export const getRoomMembers = async (roomId: string): Promise<Profile[]> => {
  try {
    const { data, error } = await supabase
      .from("room_members")
      .select("user_id")
      .eq("room_id", roomId);

    if (error) throw error;

    if (data && data.length > 0) {
      const userIds = data.map((member) => member.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds);

      if (profilesError) throw profilesError;
      return profiles || [];
    }

    return [];
  } catch (error) {
    console.error(`Error getting members for room ${roomId}:`, error);
    return [];
  }
};
