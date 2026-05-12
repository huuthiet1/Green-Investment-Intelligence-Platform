import { useEffect, useState } from "react";
import api from "../../lib/axios";
import { fallbackBusinessData } from "./businessMockData";

export default function useBusinessData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api
      .get("/business/overview")
      .then((res) => mounted && setData({ ...fallbackBusinessData, ...res.data }))
      .catch(() => mounted && setData(fallbackBusinessData))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading };
}
