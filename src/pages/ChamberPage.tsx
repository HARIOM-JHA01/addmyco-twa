import Layout from "../components/Layout";

export default function ChamberPage() {
    return (
        <Layout>
            <div className="flex flex-col items-center justify-center flex-grow py-4 px-2 pb-32">
                <div className="bg-blue-100 bg-opacity-40 rounded-3xl p-6 w-full max-w-md mx-auto flex flex-col items-center shadow-lg">
                    <h2 className="text-2xl font-bold mb-4">Chamber Page</h2>
                    <p className="text-gray-700">Welcome to the Chamber Page</p>
                </div>
            </div>
        </Layout>
    );
}