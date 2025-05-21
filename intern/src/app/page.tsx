"use client";

import { useEffect } from "react";
import { useAuth } from "../../component/provider/keycloakprovider";
import { useRouter } from "next/navigation";
import { baseURL } from "../../client/api";

export default function Home() {
  const router = useRouter();
  const { token, authenticated } = useAuth();
  // const [message, setMessage] = useState("");

  const checkKeys = async (token: string) => {
    console.log(baseURL);
    const res = await fetch(`${baseURL}/keys`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(res);

    if (res.status === 200) {
      router.push("/files");
    } else {
      router.push("/fetchkey");
    }
  };

  useEffect(() => {
    console.log(authenticated, token);
    if (!authenticated || !token) return;
    (async () => {
      await checkKeys(token);
    })();
  }, [authenticated, token]);

  return (
    <main className="p-4">
      <>loading.....</>
    </main>
  );
}
