import { Github, Twitter, Heart, Code, Coffee } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

const AboutDeveloper = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-google-blue rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 right-20 w-16 h-16 bg-google-green rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-orange-500 rounded-full animate-bounce delay-300"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Meet the
            <span className="text-google-blue"> Developer</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Passionate about creating tools that make life easier
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="p-8 md:p-12 shadow-2xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Developer Info */}
                <div className="text-center md:text-left">
                  <div className="flex justify-center md:justify-start mb-6">
                    <div className="relative group">
                      <Avatar className="w-32 h-32 ring-4 ring-google-blue/20 group-hover:ring-google-blue/40 transition-all duration-300">
                        <AvatarImage src="/lovable-uploads/a72b0b7a-9b38-4475-9aca-ff1941e2372c.png" alt="Atul Waman" />
                        <AvatarFallback className="text-2xl font-bold">AW</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-2 -right-2 bg-google-green text-white p-2 rounded-full animate-pulse">
                        <Heart className="w-4 h-4" fill="currentColor" />
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">Atul Waman</h3>
                  <p className="text-lg text-google-blue font-semibold mb-4">vibe coding + AI&ML</p>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Building innovative solutions to help users manage their digital storage efficiently. 
                    Passionate about clean code, user experience, and making technology accessible to everyone.
                  </p>

                  {/* Social Links */}
                  <div className="flex justify-center md:justify-start space-x-4">
                    <a 
                      href="https://twitter.com/Atul_Waman_" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="group bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-full hover:from-blue-600 hover:to-blue-700 transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <Twitter className="w-5 h-5 group-hover:animate-pulse" />
                    </a>
                    <a 
                      href="https://github.com/AtulC137" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="group bg-gradient-to-r from-gray-800 to-gray-900 text-white p-3 rounded-full hover:from-gray-900 hover:to-black transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <Github className="w-5 h-5 group-hover:animate-pulse" />
                    </a>
                  </div>
                </div>

                {/* Stats/Fun Facts */}
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-google-blue/10 to-google-blue/20 p-4 rounded-xl text-center hover:scale-105 transition-transform duration-300">
                      <Code className="w-8 h-8 text-google-blue mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">vibe coder</div>
                      <div className="text-sm text-gray-600"> </div>
                    </div>
                    <div className="bg-gradient-to-br from-google-green/10 to-google-green/20 p-4 rounded-xl text-center hover:scale-105 transition-transform duration-300">
                      <Coffee className="w-8 h-8 text-google-green mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">∞</div>
                      <div className="text-sm text-gray-600">Cups of Coffee</div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-xl">
                    <h4 className="font-semibold text-gray-900 mb-2">💡 Fun Fact</h4>
                    <p className="text-gray-700 text-sm">
                      Started coding to solve my own storage problems, and now helping thousands of users do the same!
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AboutDeveloper;
