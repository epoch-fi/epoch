import Image from "next/image";

interface Props {}

const NotFound = (props: Props) => {
    return (
        <section className="min-h-screen max-w-7xl w-full">
            <div className="bg-gradient-to-r from-indigo-600 via-blue-500 to-blue-800 text-white min-h-screen flex items-center">
                <div className="container mx-auto p-4 flex flex-wrap items-center justify-center">
                    <div className="w-full md:w-5/12 text-center p-4 mx-auto">
                        <Image
                            src="https://images.unsplash.com/photo-1594322436404-5a0526db4d13?q=80&w=2029&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                            alt="Not Found"
                            width={300}
                            height={300}
                        />
                    </div>
                    <div className="w-full md:w-7/12 text-center md:text-left p-4">
                        <div className="text-6xl font-medium">404</div>
                        <div className="text-xl md:text-3xl font-medium mb-4">
                            Oops. This page has gone missing.
                        </div>
                        <div className="text-lg mb-8">
                            You may have mistyped the address or the page may
                            have moved.
                        </div>
                        <a href="/" className="border border-white rounded p-4">
                            Go Home
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default NotFound;
