import Profile from "@/components/pages/Profile";

interface ProfilePageProps {
  params: { id: string };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const userId = params.id;

  return <Profile />;
}
