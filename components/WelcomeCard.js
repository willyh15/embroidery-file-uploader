import Button from "./Button";
import { LogoutIcon } from "./Icons";
import Card from "./Card";
import { signOut } from "next-auth/react";

export default function WelcomeCard({ user }) {
  return (
    <Card title={`Welcome, ${user?.name || "User"}!`}>
      <Button onClick={() => signOut()}>
        <LogoutIcon /> Logout
      </Button>
    </Card>
  );
}