import Link from "next/link"

export default function Footer() {
    return (
        <footer className="bg-muted/80 py-16">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left md:max-w-xs">
                        <h3 className="text-lg font-semibold mb-2">Stay Connected</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Join our community for the latest updates, tips, and discussions about our products.
                        </p>
                        <div className="flex items-center justify-center md:justify-start space-x-6">
                            <Link
                                href="https://x.com/OpenPlay_Tech"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-primary transition-colors"
                            >
                                <XIcon />
                                <span className="sr-only">Twitter</span>
                            </Link>
                            <Link
                                href="https://t.me/dev_0x0687"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-primary transition-colors"
                            >
                                <TelegramIcon  />
                                <span className="sr-only">Discord</span>
                            </Link>
                        </div>
                    </div>
                    {/*<div className="text-center md:text-left md:max-w-sm">*/}
                    {/*    <h3 className="text-lg font-semibold mb-2">Never Miss an Update</h3>*/}
                    {/*    <p className="text-sm text-muted-foreground mb-4">*/}
                    {/*        Subscribe to our newsletter for exclusive content, product news, and special offers.*/}
                    {/*    </p>*/}
                    {/*    <form className="flex w-full flex-row items-center h-fit gap-2" >*/}
                    {/*        <input*/}
                    {/*            type="email"*/}
                    {/*            placeholder="Enter your email"*/}
                    {/*            className="flex-grow px-4 py-2 rounded-l-md border border-input bg-background"*/}
                    {/*            required*/}
                    {/*        />*/}
                    {/*        <Button*/}
                    {/*            disabled*/}
                    {/*            type="submit"*/}
                    {/*        >*/}
                    {/*            Coming soon*/}
                    {/*            /!*<ArrowRight className="w-4 h-4 ml-2" />*!/*/}
                    {/*        </Button>*/}
                    {/*    </form>*/}
                    {/*</div>*/}
                </div>
                <div className="mt-12 pt-8 border-t border-muted-foreground/20 text-center text-sm text-muted-foreground">
                    <p className="mb-2">© {new Date().getFullYear()} OpenPlay. All rights reserved.</p>
                    {/*<p>*/}
                    {/*    <Link href="/privacy" className="hover:text-primary transition-colors">*/}
                    {/*        Privacy Policy*/}
                    {/*    </Link>*/}
                    {/*    {" | "}*/}
                    {/*    <Link href="/terms" className="hover:text-primary transition-colors">*/}
                    {/*        Terms of Service*/}
                    {/*    </Link>*/}
                    {/*</p>*/}
                </div>
            </div>
        </footer>
    )
}

const XIcon = () => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            className="w-6 h-6 fill-primary"
        >
            <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
        </svg>
    );
};

const TelegramIcon = () => {
    return (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-primary" xmlns="http://www.w3.org/2000/svg">
            <path
                  d="M23.1117 4.49449C23.4296 2.94472 21.9074 1.65683 20.4317 2.227L2.3425 9.21601C0.694517 9.85273 0.621087 12.1572 2.22518 12.8975L6.1645 14.7157L8.03849 21.2746C8.13583 21.6153 8.40618 21.8791 8.74917 21.968C9.09216 22.0568 9.45658 21.9576 9.70712 21.707L12.5938 18.8203L16.6375 21.8531C17.8113 22.7334 19.5019 22.0922 19.7967 20.6549L23.1117 4.49449ZM3.0633 11.0816L21.1525 4.0926L17.8375 20.2531L13.1 16.6999C12.7019 16.4013 12.1448 16.4409 11.7929 16.7928L10.5565 18.0292L10.928 15.9861L18.2071 8.70703C18.5614 8.35278 18.5988 7.79106 18.2947 7.39293C17.9906 6.99479 17.4389 6.88312 17.0039 7.13168L6.95124 12.876L3.0633 11.0816ZM8.17695 14.4791L8.78333 16.6015L9.01614 15.321C9.05253 15.1209 9.14908 14.9366 9.29291 14.7928L11.5128 12.573L8.17695 14.4791Z"
                  />
        </svg>
    );
};

