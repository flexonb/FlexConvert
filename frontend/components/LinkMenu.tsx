import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ExternalLink, BookOpen, Shield, LifeBuoy } from "lucide-react";

export default function LinkMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-9 gap-2">
          Links <ExternalLink className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Resources</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <a
              href="/docs.html"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer gap-2 flex items-center"
            >
              <BookOpen className="w-4 h-4" />
              Documentation
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a
              href="/privacy.html"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer gap-2 flex items-center"
            >
              <Shield className="w-4 h-4" />
              Privacy &amp; Security
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a
              href="/support.html"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer gap-2 flex items-center"
            >
              <LifeBuoy className="w-4 h-4" />
              Support
            </a>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
