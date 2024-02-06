use tauri::{ Menu, Submenu, MenuItem, CustomMenuItem };

fn new_gear() -> Submenu {
  let submenu_gear = Submenu::new(
    "Gear",
    Menu::new()
      .add_native_item(MenuItem::Copy)
      .add_native_item(MenuItem::Paste)
      .add_native_item(MenuItem::Separator)
      .add_native_item(MenuItem::Zoom)
      .add_native_item(MenuItem::Separator)
      .add_native_item(MenuItem::Hide)
      .add_native_item(MenuItem::CloseWindow)
      .add_native_item(MenuItem::Quit),
  );

  return submenu_gear;
}

fn new_customer() -> Submenu {
  let close = CustomMenuItem::new("close".to_string(), "Close");
  let quit: CustomMenuItem = CustomMenuItem::new("quit".to_string(), "Quit");
  let submenu_customer = Submenu::new(
    "Customer", 
    Menu::new()
      .add_item(close)
      .add_item(quit)
    );
  return submenu_customer;
}

pub fn new() -> Menu {
  let menus = Menu::new()
  .add_submenu(new_gear())
  .add_submenu(new_customer());
  return menus;
}