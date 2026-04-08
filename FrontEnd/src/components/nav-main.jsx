import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Link, useLocation } from "react-router-dom"

export function NavMain({ items }) {
  const location = useLocation()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform Navigation</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                tooltip={item.title}
                isActive={location.pathname === item.url}
                render={
                  <Link to={item.url} className="flex items-center gap-3 w-full">
                    <item.icon className="h-5 w-5" />
                    <span className="flex-1">{item.title}</span>
                    {item.badge && (
                      <span className="bg-primary text-primary-foreground text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                }
              />
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
