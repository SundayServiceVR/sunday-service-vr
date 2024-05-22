// from https://stackoverflow.com/a/73854973/5829399

import { ReactNode } from "react";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";

interface RenderRouteWithOutletContextProps<T> {
  context: T;
  children: ReactNode;
}

export const RenderRouteWithOutletContext = <T,>({
  context,
  children,
}: RenderRouteWithOutletContextProps<T>) => {
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
