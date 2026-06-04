import { cn } from "@/lib/utils";
import { FileText } from "lucide-react";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-bold", className)}>
      <FileText className="text-primary" />
      <span>
        Resum<span className="text-primary">a</span>
      </span>
    </span>
  );
}
