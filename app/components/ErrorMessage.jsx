import { Alert, AlertDescription } from "@/components/ui/alert";
import { HiExclamation } from "react-icons/hi";

export function ErrorMessage({ message }) {
  if (!message) return null;

  return (
    <div className="flex items-start p-3 mt-4 rounded-lg bg-red-50 border border-red-100 text-red-700">
      <HiExclamation className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
