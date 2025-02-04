import React from "react";


export default function CreateGameLayout({children}: { children: React.ReactNode }) {
    return (
        // <div
        //     className={"absolute inset-0 bg-[hsla(0,0%,100%,1)] bg-[radial-gradient(at_71%_0%,_hsla(338,95%,53%,0.1)_0px,_transparent_50%),_radial-gradient(at_31%_0%,_hsla(23,97%,63%,0.1)_0px,_transparent_50%),_radial-gradient(at_98%_67%,_hsla(23,97%,63%,0.1)_0px,_transparent_50%),_radial-gradient(at_1%_67%,_hsla(338,95%,53%,0.1)_0px,_transparent_50%)] bg-cover"}
        // >
        <div
            className={"absolute inset-0 bg-background bg-cover"}
        >
            <div className={"absolute inset-0 flex items-center justify-center"}>
                {children}
            </div>
        </div>
    );
}