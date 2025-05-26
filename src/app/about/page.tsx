import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Users, Award, Heart } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center">
        <Image
          src="https://i.ytimg.com/vi/xywfU1-7pvY/maxresdefault.jpg"
          alt="Our Kitchen"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">About Menu+</h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto">Crafting exceptional dining experiences since 2010</p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <p className="text-muted-foreground mb-4">
                Menu+ began as a small family restaurant with a simple mission: to serve delicious, high-quality food in
                a warm and welcoming environment. What started as a dream has grown into a beloved dining destination.
              </p>
              <p className="text-muted-foreground mb-4">
                Our commitment to using fresh, locally-sourced ingredients and traditional cooking methods has remained
                unchanged. Every dish is prepared with passion and attention to detail, ensuring that each meal is a
                memorable experience.
              </p>
              <p className="text-muted-foreground">
                Today, we're proud to serve thousands of satisfied customers across multiple locations, while
                maintaining the same family values and dedication to excellence that started it all.
              </p>
            </div>
            <div className="relative h-96">
              <Image
                src="https://cdn.shopify.com/s/files/1/1353/1137/files/Restaurant-Manager-1080x6752.jpg?v=1610554257"
                alt="Restaurant Owners"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Quality</h3>
                <p className="text-muted-foreground">
                  We never compromise on the quality of our ingredients or preparation
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Community</h3>
                <p className="text-muted-foreground">
                  Building lasting relationships with our customers and local community
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Excellence</h3>
                <p className="text-muted-foreground">Striving for excellence in every aspect of our service</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Passion</h3>
                <p className="text-muted-foreground">Every dish is prepared with love and dedication to our craft</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: "Chef Marco Rodriguez", role: "Head Chef", image: "https://www.howcast.com/.image/t_share/MTU5NzA0NjU0NzYzNzI5OTQw/zb-how-to-hire-a-restaurant-chef-promo-image.jpg" },
              { name: "Sarah Johnson", role: "Restaurant Manager", image: "https://www.servicethatsells.com/upload_path/2017/10/10-17-17-New-Restaurant-Managers-Large.jpg" },
              { name: "David Chen", role: "Sous Chef", image: "https://macaonews.org/wp-content/uploads/2022/03/Minimised_Chef_Sam_Sham-138-copy.jpg" },
            ].map((member, index) => (
              <Card key={index}>
                <div className="relative h-64">
                  <Image
                    src={`${member.image}`}
                    alt={member.name}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                </div>
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold text-lg mb-1">{member.name}</h3>
                  <p className="text-muted-foreground">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
