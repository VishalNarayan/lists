import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useId } from "react";

export default function Component() {
  const id = useId();
  return (
    <div className="flex items-center gap-2">
      <Checkbox id={id} defaultChecked />
      <Label htmlFor={id} className="peer-data-[state=checked]:line-through">
        Simple todo item
      </Label>
    </div>
  );
}
