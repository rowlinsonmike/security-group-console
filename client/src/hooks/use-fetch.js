import { useRouter } from "next/router";
import { useAuth } from "src/hooks/use-auth";

const _fetch = async (auth, router, url, config) => {
  let jwt = JSON.parse(localStorage.getItem("sgc_jwt"));
  try {
    const result = await fetch(url, {
      ...config,
      ...{
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt?.jwt?.access_token}`,
        },
      },
    });
    if (result.status === 403 || !result.ok) {
      auth.signOut();
      router.push("/auth/login");
    }
    return result;
  } catch (e) {
    console.log("error", e);
    return { json: () => null };
  }
};
const useFetch = () => {
  const router = useRouter();
  const auth = useAuth();
  return (url, config = {}) => _fetch(auth, router, url, config);
};

export default useFetch;
