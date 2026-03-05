import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";

import { linkItems } from "../data/linkItems";
import Link from "next/link";
import { FaAngleDown } from "react-icons/fa";
import { scrollToSection } from "../utils/scrollTo";

export default function NavMenu() {
  return (
    <Menubar className="border-none flex max-lg:flex-col max-lg:h-fit gap-2">
      {linkItems.map((item, index) => (
        <MenubarMenu>
          <MenubarTrigger
            key={index}
            className="hover:bg-white/10 group cursor-pointer max-lg:w-full max-lg:justify-between min-w-28 lg:justify-center p-2 flex items-center gap-2 transition-colors duration-500">
            {item.title}
            <FaAngleDown />
          </MenubarTrigger>
          <MenubarContent className="bg-white border-none max-lg:min-w-56 max-lg:ml-16">
            {item.items.map((item, index) => (
              <MenubarItem
                key={index}
                className="hover:bg-primary/10 text-primary hover:font-medium transition-colors duration-500">
                <Link href={item.url}>{item.title}</Link>
              </MenubarItem>
            ))}
          </MenubarContent>
        </MenubarMenu>
      ))}

      <Link
        href="/iniciatives"
        className="hover:bg-white/10 max-lg:w-full rounded-md cursor-pointer p-2 flex items-center gap-2">
        Actividades
      </Link>

      <button
        onClick={() => scrollToSection("footer")}
        className="hover:bg-white/10 max-lg:w-full rounded-md cursor-pointer p-2 flex items-center gap-2">
        Contactos
      </button>
    </Menubar>
  );
}
