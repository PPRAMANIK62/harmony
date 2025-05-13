import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

type Props = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const Logo = ({ size = "md", className }: Props) => {
  const navigate = useNavigate();
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <div
      className={cn("flex items-center gap-2", className)}
      onClick={() => navigate("/")}
    >
      {/* <div className="relative">
        <div className="w-8 h-8 bg-harmony-primary rounded-full flex items-center justify-center">
          <div className="equalizer-bars">
            <div className="equalizer-bar"></div>
            <div className="equalizer-bar"></div>
            <div className="equalizer-bar"></div>
          </div>
        </div>
      </div> */}
      <span className={cn("font-bold tracking-tight", sizeClasses[size])}>
        Harmony
      </span>
    </div>
  );
};

export default Logo;
