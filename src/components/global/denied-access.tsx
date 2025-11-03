"use client";


// Define the FlashcardProps type
interface DeniedAccessProps {
  isSubscribed: boolean;
}

const DeniedAccess: React.FC<DeniedAccessProps> = ({ isSubscribed }) => {
    if (isSubscribed) return null;

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-lg flex items-center justify-center z-20">
        <div className="text-center text-white">
            <h2 className="text-2xl font-bold">Subscribe to Access Full Features</h2>
            <p className="mt-2 text-zinc-500">Unlock all the content by subscribing to our service.</p>
        </div>
    </div>
  );
};

export default DeniedAccess;
