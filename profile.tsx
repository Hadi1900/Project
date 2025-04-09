import { Link } from "wouter";
import { MaterialIcon } from "@/components/ui/material-icon";
import { Button } from "@/components/ui/button";

export default function Profile() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <div className="flex items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mr-4">
            <MaterialIcon name="person" className="text-3xl text-gray-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-1">Your Movie Profile</h1>
            <p className="text-gray-400">Manage your profile settings</p>
          </div>
        </div>
        
        <div className="flex flex-col items-center py-12 text-center">
          <div className="p-4 rounded-full bg-yellow-400/20 flex items-center justify-center mb-6">
            <MaterialIcon name="construction" className="text-yellow-400 text-4xl" />
          </div>
          
          <h2 className="text-xl font-bold mb-2">Profile Settings Coming Soon</h2>
          <div className="border-b border-gray-700 w-16 mx-auto mb-6"></div>
          
          <p className="text-gray-300 mb-6 max-w-md">
            We're working hard to build your personal profile experience with more features. 
            Profile settings will be available soon!
          </p>
          
          <div className="flex justify-center items-center mb-8">
            <div className="flex items-center">
              <MaterialIcon name="schedule" className="text-yellow-400 mr-2" />
              <span>Coming soon</span>
            </div>
          </div>
          
          <div className="bg-gray-900 p-6 rounded-lg mb-6 w-full max-w-lg">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-700 rounded-full mr-3 flex items-center justify-center">
                <MaterialIcon name="person" className="text-xl" />
              </div>
              <div className="flex-1">
                <div className="h-3 bg-gray-700 rounded w-1/3 mb-2"></div>
                <div className="h-2 bg-gray-700 rounded w-1/4"></div>
              </div>
            </div>
            
            <div className="h-3 bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-700 rounded w-5/6 mb-2"></div>
            <div className="h-3 bg-gray-700 rounded w-4/6"></div>
          </div>
        </div>
        
        <div className="flex justify-center mt-6">
          <Button variant="outline" className="gap-2" asChild>
            <Link href="/">
              <MaterialIcon name="home" />
              <span>Return to Home</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}