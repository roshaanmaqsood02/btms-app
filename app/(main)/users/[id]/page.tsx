import Profile from "@/components/pages/Profile";

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;

  return <Profile usersId={id} />;
}
