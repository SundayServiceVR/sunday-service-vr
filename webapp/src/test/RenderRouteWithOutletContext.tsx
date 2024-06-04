// from https://stackoverflow.com/a/73854973/5829399

import { ReactNode } from "react";
import { MemoryRouter, Outlet, OutletProps, Route, Routes } from "react-router-dom";

interface RenderRouteWithOutletContextProps {
  context: OutletProps["context"];
  children: ReactNode;
}

export const RenderRouteWithOutletContext = <T,>({
  context,
  children,
}: RenderRouteWithOutletContextProps) => {
  return (
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<Outlet context={context as T} />}>
          <Route index element={children} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
};
