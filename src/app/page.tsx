import { ChannelBadge } from "../components/shared/channel-badge";

export default function Home() {
  return (
    <main className="flex w-full max-w-3xl flex-1 flex-col items-center justify-between bg-white px-16 py-32 sm:items-start dark:bg-black">
      <ChannelBadge channel="gmail" />
    </main>
  );
}
