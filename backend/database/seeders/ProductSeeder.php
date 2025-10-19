<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        $products = [
            [
                'id' => Str::uuid(),
                'name' => 'Vitamin C Serum Premium',
                'code' => 'VCS-001',
                'brand' => 'PIM Cosmetics',
                'description' => 'Advanced vitamin C serum for anti-aging and brightening',
                'detailed_description' => 'Premium anti-aging serum formulated with 15% L-Ascorbic Acid, Hyaluronic Acid, and Vitamin E for maximum skin brightening and collagen synthesis.',
                'specifications' => '30ml glass dropper bottle, pH 3.5-4.0, shelf life 24 months',
                'ingredients' => 'Aqua, L-Ascorbic Acid (15%), Sodium Hyaluronate, Tocopheryl Acetate (Vitamin E), Glycerin, Propylene Glycol, Sodium Benzoate, Potassium Sorbate',
                'usage' => 'Anti-aging, skin brightening, collagen production, dark spot reduction',
                'instructions' => 'Apply 2-3 drops to clean face in the morning. Follow with moisturizer and sunscreen. Start with alternate day use.',
                'storage' => 'Store in refrigerator (2-8°C) to maintain potency. Keep away from light and heat.',
                'development_reason' => 'Market demand for premium vitamin C serum with proven efficacy and stability',
                'similar_products' => 'SkinCeuticals CE Ferulic, The Ordinary Vitamin C Suspension 23%',
                'usp' => 'Stable L-Ascorbic Acid formula, medical-grade concentration, pharmaceutical packaging',
                'primary_owner_department' => 'RND',
                'secondary_access_departments' => json_encode(['MKT', 'ECOM', 'PUR']),
                'status' => 'active',
                'compliance_percentage' => 95.00,
            ],
            [
                'id' => Str::uuid(),
                'name' => 'Hydrating Face Moisturizer',
                'code' => 'HFM-002',
                'brand' => 'PIM Cosmetics',
                'description' => 'Daily moisturizer with ceramides and niacinamide',
                'detailed_description' => 'Lightweight yet deeply hydrating facial moisturizer containing 5% Niacinamide, Ceramide Complex, and Hyaluronic Acid for barrier repair and hydration.',
                'specifications' => '50ml airless pump bottle, pH 5.5-6.5, shelf life 36 months',
                'ingredients' => 'Aqua, Niacinamide (5%), Ceramide NP, Ceramide AP, Ceramide EOP, Sodium Hyaluronate, Glycerin, Dimethicone, Cholesterol, Carbomer',
                'usage' => 'Daily hydration, barrier repair, oil control, pore refinement',
                'instructions' => 'Apply to clean face morning and evening. Massage gently until absorbed. Can be used under makeup.',
                'storage' => 'Store at room temperature (15-25°C). Avoid direct sunlight and heat.',
                'development_reason' => 'Need for multi-functional daily moisturizer suitable for all skin types',
                'similar_products' => 'CeraVe Daily Moisturizing Lotion, Paula\'s Choice CALM Restoring Moisturizer',
                'usp' => 'Triple ceramide complex, optimal niacinamide concentration, non-comedogenic formula',
                'primary_owner_department' => 'RND',
                'secondary_access_departments' => json_encode(['MKT', 'ECOM']),
                'status' => 'active',
                'compliance_percentage' => 88.50,
            ],
            [
                'id' => Str::uuid(),
                'name' => 'Gentle Cleansing Gel',
                'code' => 'GCG-003',
                'brand' => 'PIM Cosmetics',
                'description' => 'pH-balanced cleansing gel for sensitive skin',
                'detailed_description' => 'Ultra-gentle, soap-free cleansing gel formulated with PHA (Gluconolactone) and botanical extracts for effective cleansing without irritation.',
                'specifications' => '150ml pump bottle, pH 5.0-5.5, shelf life 24 months',
                'ingredients' => 'Aqua, Cocamidopropyl Betaine, Gluconolactone (2%), Aloe Barbadensis Leaf Juice, Chamomilla Recutita Extract, Panthenol, Allantoin, Sodium Cocoyl Isethionate',
                'usage' => 'Daily cleansing, makeup removal, gentle exfoliation for sensitive skin',
                'instructions' => 'Apply to damp skin, massage gently for 30 seconds, rinse with lukewarm water. Use morning and evening.',
                'storage' => 'Store at room temperature (15-25°C). Keep bottle tightly closed.',
                'development_reason' => 'Market gap for effective yet ultra-gentle cleanser for sensitive and reactive skin types',
                'similar_products' => 'Cetaphil Gentle Skin Cleanser, La Roche-Posay Toleriane Caring Wash',
                'usp' => 'PHA technology for gentle exfoliation, dermatologist-tested, fragrance-free',
                'primary_owner_department' => 'RND',
                'secondary_access_departments' => json_encode(['MKT', 'ECOM', 'PUR']),
                'status' => 'development',
                'compliance_percentage' => 65.00,
            ],
            [
                'id' => Str::uuid(),
                'name' => 'Retinol Night Cream',
                'code' => 'RNC-004',
                'brand' => 'PIM Cosmetics',
                'description' => 'Anti-aging night cream with retinol and peptides',
                'detailed_description' => 'Advanced anti-aging night treatment containing 0.5% Encapsulated Retinol, Peptide Complex, and Squalane for intensive skin renewal and repair.',
                'specifications' => '30ml airless jar, pH 6.0-7.0, shelf life 18 months, requires stability testing',
                'ingredients' => 'Aqua, Squalane, Retinol (0.5%), Palmitoyl Pentapeptide-4, Palmitoyl Tripeptide-1, Ceramide NP, Shea Butter, Jojoba Oil, BHT, Tocopherol',
                'usage' => 'Anti-aging, wrinkle reduction, skin texture improvement, collagen stimulation',
                'instructions' => 'Apply to clean face at night only. Start 2x per week, gradually increase. Always use sunscreen during the day. Not suitable for pregnant/nursing women.',
                'storage' => 'Store in refrigerator (2-8°C) in original packaging. Protect from light and air exposure.',
                'development_reason' => 'Premium anti-aging solution targeting mature skin concerns with proven actives',
                'similar_products' => 'Neutrogena Rapid Wrinkle Repair, RoC Retinol Correxion Deep Wrinkle Night Cream',
                'usp' => 'Encapsulated retinol for stability, synergistic peptide complex, medical-grade formulation',
                'primary_owner_department' => 'RND',
                'secondary_access_departments' => json_encode(['LEG', 'MKT']),
                'status' => 'development',
                'compliance_percentage' => 45.00,
            ],
            [
                'id' => Str::uuid(),
                'name' => 'Sunscreen SPF 50+',
                'code' => 'SS50-005',
                'brand' => 'PIM Cosmetics',
                'description' => 'Broad spectrum sunscreen for daily protection',
                'detailed_description' => 'High-performance mineral-chemical hybrid sunscreen providing broad spectrum SPF 50+ protection with antioxidants and hydrating ingredients.',
                'specifications' => '50ml pump tube, SPF 50+ PA+++, water-resistant 80 minutes, shelf life 30 months',
                'ingredients' => 'Aqua, Zinc Oxide (12%), Titanium Dioxide (6%), Octinoxate (7.5%), Avobenzone (3%), Vitamin E, Vitamin C, Hyaluronic Acid, Glycerin',
                'usage' => 'Daily sun protection, UV defense, antioxidant protection, makeup base',
                'instructions' => 'Apply generously 15 minutes before sun exposure. Reapply every 2 hours or after swimming/sweating. Use as final step in skincare routine.',
                'storage' => 'Store at room temperature below 30°C. Avoid freezing and direct sunlight.',
                'development_reason' => 'Comprehensive sun protection product meeting consumer demand for multi-benefit sunscreen',
                'similar_products' => 'EltaMD UV Clear, La Roche-Posay Anthelios Ultra Light Fluid',
                'usp' => 'Hybrid mineral-chemical formula, antioxidant boost, lightweight non-greasy texture',
                'primary_owner_department' => 'RND',
                'secondary_access_departments' => json_encode(['LEG', 'MKT', 'ECOM']),
                'status' => 'active',
                'compliance_percentage' => 92.00,
            ],
        ];

        foreach ($products as $productData) {
            // Temporarily disable activity logging during seeding
            Product::withoutEvents(function () use ($productData) {
                Product::create($productData);
            });
        }
    }
}
