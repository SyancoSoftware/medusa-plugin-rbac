export const SingleColumnLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <div className="flex flex-col gap-y-3">{children}</div>;
};