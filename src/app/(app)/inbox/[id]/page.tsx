"use client";
import { useParams } from "next/navigation";

export default function Thread() {
  const { id } = useParams();

  return <div className="flex h-full">Hello {id}</div>;
}
