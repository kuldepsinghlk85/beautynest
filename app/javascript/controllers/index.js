import { application } from "controllers/application"
import SidebarController from "controllers/sidebar_controller"
import ThemeController from "controllers/theme_controller"
import DropdownController from "controllers/dropdown_controller"
import SearchController from "controllers/search_controller"
import ConfirmModalController from "controllers/confirm_modal_controller"
import NotificationBellController from "controllers/notification_bell_controller"

application.register("sidebar", SidebarController)
application.register("theme", ThemeController)
application.register("dropdown", DropdownController)
application.register("search", SearchController)
application.register("confirm-modal", ConfirmModalController)
application.register("notification-bell", NotificationBellController)
