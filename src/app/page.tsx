import Image from "next/image"
import { ShoppingCart, ChevronRight, Star } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-4 md:px-8">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-red-600 font-bold text-xl mr-8">
              <span className="bg-red-600 text-white rounded-full p-1 mr-1">🍔</span> FoodHub
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link href="#" className="text-gray-800 hover:text-red-600">
                Home
              </Link>
              <Link href="#" className="text-gray-800 hover:text-red-600">
                Menu
              </Link>
              <Link href="#" className="text-gray-800 hover:text-red-600">
                About
              </Link>
              <Link href="#" className="text-gray-800 hover:text-red-600">
                Shop
              </Link>
              <Link href="#" className="text-gray-800 hover:text-red-600">
                Blog
              </Link>
            </nav>
          </div>
          <div>
            <button className="bg-yellow-500 text-white px-4 py-2 rounded-md flex items-center">
              <ShoppingCart className="mr-2" size={18} />
              Cart
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-red-900 text-white overflow-hidden">
        <div className="container mx-auto py-16 px-4 md:px-8 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 z-10">
            <div className="text-yellow-500 italic mb-2">Hungry? Find Food!</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              HOT SPICY
              <br />
              CHIKEN BURGER
            </h1>
            <div className="mb-6">
              <span className="font-bold text-2xl">From Only</span>
              <span className="text-4xl font-bold ml-2">$25</span>
            </div>
            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-medium">
              ORDER NOW
            </button>
          </div>
          <div className="md:w-1/2 mt-8 md:mt-0">
            <Image
              src="/placeholder.svg?height=500&width=500"
              alt="Hot Spicy Chicken Burger"
              width={500}
              height={500}
              className="object-contain"
            />
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/2 bg-red-800 rounded-l-full opacity-50"></div>
      </section>

      {/* Popular Food Items */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-2xl font-bold mb-8 text-center">Popular Food Items</h2>
          <div className="grid grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="bg-white rounded-full p-2 shadow-md mb-2">
                <Image
                  src="/placeholder.svg?height=80&width=80"
                  alt="Chicken"
                  width={80}
                  height={80}
                  className="rounded-full"
                />
              </div>
              <span className="text-sm font-medium">Chicken</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white rounded-full p-2 shadow-md mb-2">
                <Image
                  src="/placeholder.svg?height=80&width=80"
                  alt="The Burger"
                  width={80}
                  height={80}
                  className="rounded-full"
                />
              </div>
              <span className="text-sm font-medium">The Burger</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white rounded-full p-2 shadow-md mb-2">
                <Image
                  src="/placeholder.svg?height=80&width=80"
                  alt="Hot Pizza"
                  width={80}
                  height={80}
                  className="rounded-full"
                />
              </div>
              <span className="text-sm font-medium">Hot Pizza</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white rounded-full p-2 shadow-md mb-2">
                <Image
                  src="/placeholder.svg?height=80&width=80"
                  alt="Fries"
                  width={80}
                  height={80}
                  className="rounded-full"
                />
              </div>
              <span className="text-sm font-medium">Fries</span>
            </div>
          </div>
        </div>
      </section>

      {/* Promotional Banners */}
      <section className="py-8 bg-gray-100">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="bg-black text-white rounded-lg overflow-hidden relative p-6">
              <div className="z-10 relative">
                <h3 className="text-xl font-bold mb-1">SUPER</h3>
                <h3 className="text-xl font-bold mb-4">DELICIOUS</h3>
                <div className="flex items-center text-xs mb-4">
                  <span className="bg-gray-800 px-2 py-1 rounded mr-2">BURGER</span>
                  <span className="bg-gray-800 px-2 py-1 rounded">SUPER HAMBURGER DEALS</span>
                </div>
                <div className="text-3xl font-bold">$20.99</div>
              </div>
              <Image
                src="/placeholder.svg?height=200&width=200"
                alt="Super Delicious Burger"
                width={200}
                height={200}
                className="absolute right-0 bottom-0"
              />
            </div>
            <div className="bg-red-600 text-white rounded-lg overflow-hidden relative p-6">
              <div className="z-10 relative">
                <h3 className="text-xl font-bold mb-1">CRISPY & HOT</h3>
                <h3 className="text-xl font-bold mb-4">FRIED CHICKEN</h3>
                <div className="text-3xl font-bold">$15.99</div>
              </div>
              <Image
                src="/placeholder.svg?height=200&width=200"
                alt="Fried Chicken"
                width={200}
                height={200}
                className="absolute right-0 bottom-0"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Today's Available */}
      <section className="py-16 bg-black text-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-2xl font-bold mb-2">Today's Available Day</h2>
              <p className="text-gray-400 mb-4">Special Offer For Limited Time</p>
              <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-medium">
                SEE MENU
              </button>
            </div>
            <div className="md:w-1/2">
              <Image
                src="/placeholder.svg?height=300&width=300"
                alt="Today's Special"
                width={300}
                height={300}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Popular Fast Foods */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-2xl font-bold mb-8 text-center">Popular Fast Foods</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div key={item} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative">
                  <Image
                    src="/placeholder.svg?height=150&width=150"
                    alt={`Food Item ${item}`}
                    width={150}
                    height={150}
                    className="w-full h-32 object-cover"
                  />
                  {item % 2 === 0 && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                      20% OFF
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-medium text-sm">Chicken Wing</h3>
                    <div className="flex items-center text-yellow-500">
                      <Star size={12} fill="currentColor" />
                      <span className="text-xs ml-1">4.5</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">Chicken Wing</div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-medium">
              VIEW ALL MENU
            </button>
          </div>
        </div>
      </section>

      {/* Trending Food Combo */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center max-w-5xl mx-auto">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-2xl font-bold mb-2">Trending Food Combo</h2>
              <h3 className="text-xl mb-6">
                With Less <span className="text-yellow-500">30%</span>
              </h3>

              <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <span className="text-yellow-500 font-bold mr-2">Combo</span>
                  <span className="text-sm">Beef Burger + French Fries + Drink</span>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-yellow-500 font-bold mr-2">Price</span>
                  <span className="text-sm">
                    $12.99 <span className="line-through text-gray-500 ml-2">$18.99</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="md:w-1/2">
              <Image
                src="/placeholder.svg?height=400&width=400"
                alt="Trending Food Combo"
                width={400}
                height={400}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-red-600 text-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="text-center">
              <h3 className="font-bold mb-2">24/7</h3>
              <p className="text-sm">Service Available</p>
            </div>
            <div className="text-center">
              <h3 className="font-bold mb-2">Quality</h3>
              <p className="text-sm">Food & Drinks</p>
            </div>
            <div className="text-center">
              <h3 className="font-bold mb-2">Delivery</h3>
              <p className="text-sm">Within 30 Minutes</p>
            </div>
            <div className="text-center">
              <h3 className="font-bold mb-2">Best Price</h3>
              <p className="text-sm">Guaranteed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quality Meat Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center max-w-5xl mx-auto">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-3xl font-bold mb-4">
                Where Quality Meat
                <br />
                Excellent Service
              </h2>
              <p className="text-gray-600 mb-6">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis,
                pulvinar dapibus leo.
              </p>
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium">
                ORDER NOW
              </button>
            </div>
            <div className="md:w-1/2">
              <Image
                src="/placeholder.svg?height=400&width=400"
                alt="Quality Burger"
                width={400}
                height={400}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Special Meal Promotions */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="bg-black text-white rounded-lg overflow-hidden relative p-6">
              <div className="z-10 relative">
                <div className="text-yellow-500 italic mb-2">Hungry? Find Food!</div>
                <h3 className="text-xl font-bold mb-4">
                  Special
                  <br />
                  Meal
                </h3>
                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                  ORDER NOW
                </button>
              </div>
              <Image
                src="/placeholder.svg?height=200&width=200"
                alt="Special Meal"
                width={200}
                height={200}
                className="absolute right-0 bottom-0"
              />
            </div>
            <div className="bg-red-600 text-white rounded-lg overflow-hidden relative p-6">
              <div className="z-10 relative">
                <div className="text-yellow-500 italic mb-2">Hungry? Find Food!</div>
                <h3 className="text-xl font-bold mb-4">
                  FAST Foods
                  <br />
                  Delivery
                </h3>
                <button className="bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium">
                  ORDER NOW
                </button>
              </div>
              <Image
                src="/placeholder.svg?height=200&width=200"
                alt="Fast Foods"
                width={200}
                height={200}
                className="absolute right-0 bottom-0"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Combo Meal Showcase */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center max-w-5xl mx-auto">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <Image
                src="/placeholder.svg?height=400&width=400"
                alt="Combo Meal"
                width={400}
                height={400}
                className="object-contain"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-4">
                KFc Chicken Hot
                <br />
                Wing & French Fries
              </h2>
              <div className="flex space-x-4 mb-6">
                <div className="flex flex-col items-center">
                  <div className="bg-yellow-500 text-white rounded-full w-10 h-10 flex items-center justify-center mb-1">
                    <Star size={16} fill="currentColor" />
                  </div>
                  <span className="text-xs">Quality</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-yellow-500 text-white rounded-full w-10 h-10 flex items-center justify-center mb-1">
                    <Star size={16} fill="currentColor" />
                  </div>
                  <span className="text-xs">Fresh</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-yellow-500 text-white rounded-full w-10 h-10 flex items-center justify-center mb-1">
                    <Star size={16} fill="currentColor" />
                  </div>
                  <span className="text-xs">Tasty</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-yellow-500 text-white rounded-full w-10 h-10 flex items-center justify-center mb-1">
                    <Star size={16} fill="currentColor" />
                  </div>
                  <span className="text-xs">Hot</span>
                </div>
              </div>
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium">
                ORDER NOW
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-gray-500 mb-4">Tasty Reviews</p>
            <blockquote className="text-xl italic mb-6">
              "Thank You For Warm Last Night, It Was Amazing! I Want To Try The Best Meal I Have Had In A Long Time,
              Will Definitely Be Coming Back Again"
            </blockquote>
            <div className="flex justify-center space-x-2 mb-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="w-8 h-8 rounded-full overflow-hidden">
                  <Image
                    src="/placeholder.svg?height=32&width=32"
                    alt={`Customer ${item}`}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Delivery Challenge */}
      <section className="py-12 bg-red-600 text-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center max-w-5xl mx-auto">
            <div className="md:w-2/3 mb-8 md:mb-0">
              <h2 className="text-3xl font-bold mb-4">
                30 Minutes Fast
                <br />
                Delivery Challenge
              </h2>
              <button className="bg-white text-red-600 hover:bg-gray-100 px-6 py-2 rounded-md font-medium">
                ORDER NOW
              </button>
            </div>
            <div className="md:w-1/3">
              <Image
                src="/placeholder.svg?height=200&width=200"
                alt="Delivery Person"
                width={200}
                height={200}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Food Gallery */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="overflow-hidden rounded-lg">
                <Image
                  src="/placeholder.svg?height=150&width=150"
                  alt={`Food Gallery ${item}`}
                  width={150}
                  height={150}
                  className="w-full h-32 object-cover hover:scale-110 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-white border-t">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto mb-8">
            <div>
              <h3 className="font-bold text-red-600 mb-4">FOODHUB</h3>
              <p className="text-sm text-gray-600 mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">About</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>About Us</li>
                <li>Features</li>
                <li>News & Blog</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Menu</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>Breakfast</li>
                <li>Lunch</li>
                <li>Dinner</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Newsletter</h3>
              <p className="text-sm text-gray-600 mb-4">Subscribe to our newsletter for updates.</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="px-4 py-2 border rounded-l-md w-full focus:outline-none"
                />
                <button className="bg-red-600 text-white px-4 py-2 rounded-r-md">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
          <div className="text-center text-sm text-gray-600 pt-8 border-t">
            <p>© 2023 FoodHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
