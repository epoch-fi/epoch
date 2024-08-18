import { Navigation } from "@/lib/dashboardNavigation";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  isExpanded: boolean;
}

/**
 * Renders a menu component with navigation links.
 *
 * @component
 * @param {Props} props - The component props.
 * @param {boolean} props.isExpanded - Indicates whether the menu is expanded or not.
 * @returns {JSX.Element} The rendered menu component.
 */
const Menu = ({ isExpanded }: Props) => {
  const pathName = usePathname();
  return (
    <div className="flex w-full flex-col items-start justify-center">
      {Navigation?.map((item) => (
        <div key={item.id} className="w-full">
          <Link
            href={item.href}
            className={`${
              pathName === item.href
                ? "bg-primaryGray text-white"
                : "text-primaryText hover:bg-primaryGray hover:text-white "
            } "group flex items-center gap-x-3 px-6 py-4 text-sm font-semibold leading-6`}
          >
            <item.icon
              className={`${
                pathName === item.href
                  ? "text-white"
                  : "text-primaryText group-hover:text-white"
              } h-6 w-6`}
            />
            <span
              className={`text-sm font-normal ${isExpanded ? "block" : "hidden"}`}
            >
              {item.name}
            </span>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default Menu;
