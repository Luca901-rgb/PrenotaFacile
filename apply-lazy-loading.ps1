$files = @(
    "app\api\services\route.ts",
    "app\api\staff\route.ts",
    "app\api\bookings\[id]\route.ts",
    "app\api\services\[id]\route.ts",
    "app\api\staff\[id]\route.ts",
    "app\api\dashboard\stats\route.ts",
    "app\api\settings\business\route.ts",
    "app\api\public\booking\[slug]\route.ts",
    "app\api\public\booking\[slug]\timeslots\route.ts"
)

foreach ($file in $files) {
    $content = Get-Content $file -Raw
    
    # Skip if already has lazy loading
    if ($content -match "await import\('@/lib/prisma'\)") {
        Write-Host "Skipping $file - already has lazy loading"
        continue
    }
    
    # Replace the import statement
    $newContent = $content -replace "import \{ prisma \} from '@/lib/prisma';?", ""
    
    # Add lazy load at the start of each function that uses prisma
    $newContent = $newContent -replace "(export async function \w+\([^)]*\) \{[\r\n\s]*try \{)", "`$1`n    const { prisma } = await import('@/lib/prisma');"
    
    Set-Content -Path $file -Value $newContent -NoNewline
    Write-Host "Updated $file"
}

Write-Host "Done!"
