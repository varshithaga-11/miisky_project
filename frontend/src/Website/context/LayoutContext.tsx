import { createContext, useContext, useState, ReactNode } from "react";

type LayoutContextType = {
  headerStyle: 1 | 2 | 3;
  footerStyle: 1;
  breadcrumbTitle: string | undefined;
  setHeaderStyle: (style: 1 | 2 | 3) => void;
  setBreadcrumbTitle: (title: string | undefined) => void;
};

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
  const [headerStyle, setHeaderStyle] = useState<1 | 2 | 3>(1);
  const [breadcrumbTitle, setBreadcrumbTitle] = useState<string | undefined>(undefined);

  return (
    <LayoutContext.Provider
      value={{
        headerStyle,
        footerStyle: 1,
        breadcrumbTitle,
        setHeaderStyle,
        setBreadcrumbTitle,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
};
