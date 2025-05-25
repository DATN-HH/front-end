import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Star, MapPin, Phone, Award, Users, ChefHat } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <Image
          src="/placeholder.svg?height=800&width=1600&query=luxury fine dining restaurant interior with elegant lighting"
          alt="Fine Dining Experience"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight">
            Culinary
            <span className="block text-primary">Excellence</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200 leading-relaxed">
            Where artistry meets flavor in an unforgettable dining experience. Discover the finest ingredients,
            masterful techniques, and impeccable service.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90">
              <Link href="/menu">Explore Our Menu</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 bg-white/10 border-white text-white hover:bg-white hover:text-black backdrop-blur-sm"
            >
              <Link href="/table-booking">Reserve Your Table</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Awards & Recognition */}
      <section className="py-16 px-4 bg-gray-900 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-serif font-bold mb-12">Awards & Recognition</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center">
              <Award className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Michelin Star</h3>
              <p className="text-gray-300 text-sm">2023 & 2024</p>
            </div>
            <div className="flex flex-col items-center">
              <Star className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-semibold mb-2">James Beard Award</h3>
              <p className="text-gray-300 text-sm">Outstanding Restaurant</p>
            </div>
            <div className="flex flex-col items-center">
              <Users className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-semibold mb-2">OpenTable</h3>
              <p className="text-gray-300 text-sm">Diners' Choice 2024</p>
            </div>
            <div className="flex flex-col items-center">
              <ChefHat className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Wine Spectator</h3>
              <p className="text-gray-300 text-sm">Award of Excellence</p>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold mb-6">The Menu+ Experience</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Every detail is carefully orchestrated to create moments that transcend ordinary dining
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="relative h-64 mb-6 rounded-lg overflow-hidden">
                <Image
                  src="/placeholder.svg?height=300&width=400&query=chef preparing gourmet dish with precision"
                  alt="Culinary Artistry"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-2xl font-serif font-semibold mb-4">Culinary Artistry</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our master chefs transform the finest ingredients into edible masterpieces, each dish telling a story of
                passion and precision.
              </p>
            </div>

            <div className="text-center">
              <div className="relative h-64 mb-6 rounded-lg overflow-hidden">
                <Image
                  src="/placeholder.svg?height=300&width=400&query=elegant restaurant service and ambiance"
                  alt="Impeccable Service"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-2xl font-serif font-semibold mb-4">Impeccable Service</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our dedicated team anticipates your every need, ensuring a seamless and memorable dining experience from
                arrival to departure.
              </p>
            </div>

            <div className="text-center">
              <div className="relative h-64 mb-6 rounded-lg overflow-hidden">
                <Image
                  src="/placeholder.svg?height=300&width=400&query=luxury restaurant private dining room"
                  alt="Elegant Atmosphere"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-2xl font-serif font-semibold mb-4">Elegant Atmosphere</h3>
              <p className="text-muted-foreground leading-relaxed">
                Sophisticated interiors and intimate lighting create the perfect backdrop for celebrations, business
                dinners, and romantic evenings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Dishes */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold mb-6">Signature Creations</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover the dishes that have earned us acclaim from critics and diners alike
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Lobster Thermidor",
                price: "$68",
                description: "Maine lobster with cognac cream sauce",
                image: "lobster thermidor fine dining presentation",
                chef: "Chef Antoine Dubois",
              },
              {
                name: "A5 Wagyu Tenderloin",
                price: "$125",
                description: "Japanese Wagyu with seasonal vegetables",
                image: "wagyu beef tenderloin with truffle",
                chef: "Chef Marcus Johnson",
              },
              {
                name: "Omakase Experience",
                price: "$185",
                description: "15-course chef's tasting menu",
                image: "omakase sushi presentation elegant",
                chef: "Chef Hiroshi Tanaka",
              },
            ].map((dish, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-56">
                  <Image
                    src={`/placeholder.svg?height=250&width=400&query=${dish.image}`}
                    alt={dish.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-serif font-semibold">{dish.name}</h3>
                    <span className="text-lg font-bold text-primary">{dish.price}</span>
                  </div>
                  <p className="text-muted-foreground mb-3">{dish.description}</p>
                  <p className="text-sm text-primary font-medium">{dish.chef}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" className="px-8">
              <Link href="/menu">View Complete Menu</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold mb-6">Our Locations</h2>
            <p className="text-xl text-muted-foreground">
              Experience Menu+ at our carefully selected venues across the nation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                city: "New York",
                address: "155 West 51st Street",
                phone: "(212) 554-1515",
                image: "new york fine dining restaurant exterior",
              },
              {
                city: "San Francisco",
                address: "2891 Mission Street",
                phone: "(415) 282-8283",
                image: "san francisco restaurant with city view",
              },
              {
                city: "Beverly Hills",
                address: "9500 Wilshire Boulevard",
                phone: "(310) 555-0199",
                image: "beverly hills luxury restaurant",
              },
              {
                city: "Chicago",
                address: "233 North Michigan Avenue",
                phone: "(312) 555-0145",
                image: "chicago fine dining establishment",
              },
            ].map((location, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={`/placeholder.svg?height=200&width=300&query=${location.image}`}
                    alt={`Menu+ ${location.city}`}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-serif font-semibold mb-2">{location.city}</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{location.address}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{location.phone}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 bg-gray-900 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-serif font-bold mb-6">Begin Your Culinary Journey</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Reserve your table today and discover why Menu+ is the destination for discerning diners
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="px-8">
              <Link href="/table-booking">Make a Reservation</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="px-8 border-white text-white hover:bg-white hover:text-black"
            >
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
