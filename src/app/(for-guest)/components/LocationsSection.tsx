'use client';

import useEmblaCarousel from 'embla-carousel-react';
import {
    Building2,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Phone,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { useBranches } from '@/api/v1/branches';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function LocationsSection() {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: 'start',
        slidesToScroll: 1,
        breakpoints: {
            '(min-width: 768px)': { slidesToScroll: 2 },
            '(min-width: 1024px)': { slidesToScroll: 4 },
        },
    });

    const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
    const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setPrevBtnDisabled(!emblaApi.canScrollPrev());
        setNextBtnDisabled(!emblaApi.canScrollNext());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onSelect);
    }, [emblaApi, onSelect]);

    const { data: branches = [], isLoading } = useBranches();

    return (
        <section className="py-20 px-4">
            <div className="container mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-serif font-bold mb-6">
                        Our Locations
                    </h2>
                    <p className="text-xl text-muted-foreground">
                        Experience Menu+ at our carefully selected venues across
                        the nation
                    </p>
                </div>

                <div className="relative">
                    {/* Carousel Viewport */}
                    <div className="overflow-hidden" ref={emblaRef}>
                        {/* Carousel Container */}
                        <div className="flex gap-8">
                            {isLoading ? (
                                <div className="w-full flex justify-center py-16">
                                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
                                </div>
                            ) : (
                                branches.map((branch) => (
                                    <div
                                        key={branch.id}
                                        className="flex-[0_0_100%] min-w-0 md:flex-[0_0_calc(50%-16px)] lg:flex-[0_0_calc(25%-16px)]"
                                    >
                                        <Card className="text-center hover:shadow-lg transition-shadow h-full">
                                            <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center">
                                                <Building2 className="h-16 w-16 text-primary/50" />
                                            </div>
                                            <CardContent className="p-6">
                                                <h3 className="text-xl font-serif font-semibold mb-2">
                                                    {branch.name}
                                                </h3>
                                                <div className="space-y-2 text-sm text-muted-foreground">
                                                    {branch.address && (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <MapPin className="h-4 w-4" />
                                                            <span>
                                                                {branch.address}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {branch.phone && (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <Phone className="h-4 w-4" />
                                                            <span>
                                                                {branch.phone}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    {!isLoading && branches.length > 0 && (
                        <>
                            <Button
                                variant="outline"
                                size="icon"
                                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-background shadow-md disabled:opacity-0"
                                onClick={scrollPrev}
                                disabled={prevBtnDisabled}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-background shadow-md disabled:opacity-0"
                                onClick={scrollNext}
                                disabled={nextBtnDisabled}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
