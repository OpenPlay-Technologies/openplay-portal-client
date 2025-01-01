"use client";

import * as React from "react";
import {Upload, X} from "lucide-react";
import {UploadClient} from "@uploadcare/upload-client";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";

interface FileUploadBoxProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
    name?: string;
    id?: string;
}

const FileUploadBox = React.forwardRef<HTMLInputElement, FileUploadBoxProps>(
    ({onChange, name, id, ...props}, ref) => {
        const [loading, setLoading] = React.useState(false);

        const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;

            console.log("File selected:", file);

            setLoading(true); // Start loading state

            try {
                const client = new UploadClient({publicKey: process.env.UPLOADCARE_PUBLIC_KEY ?? ""});
                const response = await client.uploadFile(file);

                console.log("File uploaded successfully:", response.cdnUrl);

                // Notify the parent component
                onChange?.({
                    ...e,
                    target: {
                        ...e.target,
                        value: response.cdnUrl, // Set the uploaded file's URL
                    },
                });
            } catch (error) {
                console.error("File upload failed:", error);
            } finally {
                setLoading(false); // End loading state
            }
        };

        const handleRemoveImage = () => {
            // Notify the parent component about removal
            onChange?.({
                target: {
                    name: name || "",
                    id: id || "",
                    value: "", // Clear the input value
                },
            } as unknown as React.ChangeEvent<HTMLInputElement>);
        };
        
        return (

            <div
                className={cn(
                    "bg-background aspect-square border border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-muted transition-colors relative",
                    props.value && "cursor-default"
                )}
                onClick={() => {
                    if (!loading && !props.value) {
                        const inputElement = document.getElementById(id!); // Find the input element
                        if (inputElement instanceof HTMLInputElement) {
                            inputElement.click(); // Trigger the input click
                        }
                    }
                }}
            >
                {loading && <span>Uploading...</span>}
                {props.value && (
                    <div className="relative w-full h-full">
                        <img
                            src={props.value as string}
                            alt="Uploaded"
                            className="w-full h-full object-cover rounded-xl"
                        />
                        <Button
                            type="button"
                            variant={"secondary"}
                            className="absolute top-2 right-2 rounded-full size-10"
                            onClick={handleRemoveImage}
                        >
                            <X/>
                        </Button>
                    </div>
                )}
                {!loading && !props.value && (
                    <div className={"flex flex-col align-middle items-center"}>
                        <Upload className="h-10 w-10 mb-2"/>
                        <input
                            ref={ref} // Keep the React Hook Form ref
                            id={id!} // Ensure this matches in `document.getElementById`
                            name={name}
                            type="file"
                            className="hidden"
                            onChange={handleFileUpload}
                            accept=".png, .jpg, .jpeg, .pdf"
                            {...props}
                        />
                        <span>Click to upload</span>
                    </div>
                )}
            </div>
        );
    }
);

FileUploadBox.displayName = "FileUploadBox";

export default FileUploadBox;
