const ShimmerCard = () => {
    return (
      <div className="w-full h-52 bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border animate-pulse">
        <div className="flex flex-row items-center justify-between text-gray-500">
          <div className="w-5 h-5 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
          <div className="w-5 h-5 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
        </div>
        <div className="mt-6 h-4 w-3/4 bg-gray-200 dark:bg-gray-600 rounded"></div>
        <div className="mt-4 h-4 w-1/2 bg-gray-200 dark:bg-gray-600 rounded"></div>
      </div>
    );
  };
  
  export default ShimmerCard;
  