
import { Zap, Shield, Download, FileArchive } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const WhatWeCanDo = () => {
  const features = [
    {
      icon: <Zap className="w-8 h-8 text-google-blue" />,
      title: "Instant Compression",
      description: "Compress your Google Drive files with one click - no downloads required.",
      gradient: "from-blue-500/10 to-blue-600/20"
    },
    {
      icon: <Shield className="w-8 h-8 text-google-green" />,
      title: "Secure Processing",
      description: "Your files are processed securely without leaving Google's ecosystem.",
      gradient: "from-green-500/10 to-green-600/20"
    },
    {
      icon: <FileArchive className="w-8 h-8 text-orange-500" />,
      title: "Smart Organization",
      description: "Automatically organize and manage your compressed files efficiently.",
      gradient: "from-orange-500/10 to-orange-600/20"
    },
    {
      icon: <Download className="w-8 h-8 text-purple-500" />,
      title: "Easy Recovery",
      description: "Uncompress and restore your files whenever you need them.",
      gradient: "from-purple-500/10 to-purple-600/20"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-white via-gray-50 to-blue-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-google-blue rounded-full animate-pulse"></div>
        <div className="absolute bottom-10 right-20 w-24 h-24 bg-google-green rounded-full animate-bounce delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-orange-500 rounded-full animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What We
            <span className="text-google-blue"> Can Do</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the powerful features that make SaveBits your go-to solution for Google Drive storage management
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className={`group text-center hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border-0 bg-gradient-to-br ${feature.gradient} backdrop-blur-sm hover:scale-105 relative overflow-hidden`}
            >
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <CardHeader className="pb-4 relative z-10">
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-white/80 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                    {feature.icon}
                  </div>
                </div>
                <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-google-blue transition-colors duration-300">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <CardDescription className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300 leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
              
              {/* Hover glow effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-r from-google-blue to-google-green rounded-lg transition-opacity duration-500"></div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatWeCanDo;
