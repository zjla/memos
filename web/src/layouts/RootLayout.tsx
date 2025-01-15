import { Tooltip } from "@mui/joy";
import { Button } from "@usememos/mui";
import clsx from "clsx";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useSearchParams } from "react-router-dom";
import useLocalStorage from "react-use/lib/useLocalStorage";
import usePrevious from "react-use/lib/usePrevious";
import Navigation from "@/components/Navigation";
import useCurrentUser from "@/hooks/useCurrentUser";
import useResponsiveWidth from "@/hooks/useResponsiveWidth";
import Loading from "@/pages/Loading";
import { Routes } from "@/router";
import { useMemoFilterStore } from "@/store/v1";
import { useTranslate } from "@/utils/i18n";

const RootLayout = () => {
  const t = useTranslate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { sm } = useResponsiveWidth();
  const currentUser = useCurrentUser();
  const memoFilterStore = useMemoFilterStore();
  const [collapsed, setCollapsed] = useLocalStorage<boolean>("navigation-collapsed", false);
  const [initialized, setInitialized] = useState(false);
  const pathname = useMemo(() => location.pathname, [location.pathname]);
  const prevPathname = usePrevious(pathname);

  useEffect(() => {
    if (!currentUser) {
      if (([Routes.ROOT, Routes.RESOURCES, Routes.INBOX, Routes.ARCHIVED, Routes.SETTING] as string[]).includes(location.pathname)) {
        window.location.href = Routes.EXPLORE;
        return;
      }
    }
    setInitialized(true);
  }, []);

  useEffect(() => {
    // When the route changes and there is no filter in the search params, remove all filters.
    if (prevPathname !== pathname && !searchParams.has("filter")) {
      memoFilterStore.removeFilter(() => true);
    }
  }, [prevPathname, pathname, searchParams]);

  return !initialized ? (
    <Loading />
  ) : (
    <div className="w-full min-h-full">
      <div className={clsx("w-full transition-all mx-auto flex flex-row justify-center items-start", collapsed ? "sm:pl-16" : "sm:pl-56")}>
        {sm && (
          <div
            className={clsx(
              "group flex flex-col justify-start items-start fixed top-0 left-0 select-none border-r dark:border-zinc-800 h-full bg-zinc-50 dark:bg-zinc-800 dark:bg-opacity-40 transition-all hover:shadow-xl z-2",
              collapsed ? "w-16 px-2" : "w-56 px-4",
            )}
          >
            <Navigation className="!h-auto" collapsed={collapsed} />
            <div className={clsx("w-full grow h-auto flex flex-col justify-end", collapsed ? "items-center" : "items-start")}>
              <div
                className={clsx("hidden py-3 group-hover:flex flex-col justify-center items-center")}
                onClick={() => setCollapsed(!collapsed)}
              >
                {!collapsed ? (
                  <Button className="rounded-xl" variant="plain">
                    <ChevronLeftIcon className="w-5 h-auto opacity-70 mr-1" />
                    {t("common.collapse")}
                  </Button>
                ) : (
                  <Tooltip title={t("common.expand")} placement="right" arrow>
                    <Button className="rounded-xl" variant="plain">
                      <ChevronRightIcon className="w-5 h-auto opacity-70" />
                    </Button>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>
        )}
        <main className="w-full h-auto flex-grow shrink flex flex-col justify-start items-center">
          <Suspense fallback={<Loading />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default RootLayout;
