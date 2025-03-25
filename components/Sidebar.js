import Button from "./Button";
import { ProfileIcon, SettingsIcon } from "./Icons";

export default function Sidebar({ isOpen, toggleSidebar }) {
  return (
    <>
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>Menu</h2>
          <Button onClick={toggleSidebar} className="close-sidebar-btn">X</Button>
        </div>
        <ul>
          <li><a href="#"><ProfileIcon /> Profile</a></li>
          <li><a href="#"><SettingsIcon /> Settings</a></li>
          <li><a href="#">My Files</a></li>
        </ul>
      </aside>
      {isOpen && (
        <div className="sidebar-overlay open" onClick={toggleSidebar} />
      )}
    </>
  );
}