export function getGoogleFormUrl(
  slug: string,
  eventName?: string,
): string | null {
  const googleForms: Record<string, string> = {
    // Example:
     "football": "https://docs.google.com/forms/d/e/1FAIpQLSezrtJC_sl4LjtRZ5Hd1y4uT586foXGuIHfWeu-ULvQmpFBww/viewform?usp=header",
     "basketball": "https://docs.google.com/forms/d/e/1FAIpQLScgBiB6icHwUIURFvxAJbf7b5MyxMK78LfIrzjEpOK8JDvAlA/viewform?usp=header",
     "volleyball": "https://docs.google.com/forms/d/e/1FAIpQLSdaz7wOSn8kxCqLQDdgu-TP6fb3cqbXd1o65uGZOGFYzSUR6w/viewform?usp=header",
     "Badminton": "https://docs.google.com/forms/d/e/1FAIpQLSfO7l-mgi4T-5Mdq8NuKp4R4JVDdQ8cuxK-PaTECk96bYRpOw/viewform?usp=header",
     "Table Tennis": "https://docs.google.com/forms/d/e/1FAIpQLSchmCpJLrJRpu6pXMdN-O_iuDrqDKWiQe8KS4nsY9yWwhu67g/viewform?usp=header",
     "Chess": "https://docs.google.com/forms/d/e/1FAIpQLSd4J1SznlHsKmhB1Y6mzXtIMHr3rjRSuksiBh9z13LEFvrzXA/viewform?usp=header",
     "Lawn Tennis tennis": "https://docs.google.com/forms/d/e/1FAIpQLSfhHexxTFLdQOc10XAbf4wiEVexPeIFQzdeWAOSMlnt-KO3TQ/viewform?usp=header",
     "Kho-Kho": "https://docs.google.com/forms/d/e/1FAIpQLScuCxCz55zESou_Ic1alSA_rS0oTa06ZkVwH4J3vZv8Nyx5RA/viewform?usp=header",
     "powerlifting": "https://docs.google.com/forms/d/e/1FAIpQLSdHUf4QAcyP98m5Tc0rfqWVphGYdEcP0rjxi4858oIEQNhb5g/viewform?usp=header",
     "Mixed cricket": "https://docs.google.com/forms/d/e/1FAIpQLSd2JvubvlHn2pg_33Ogf2JQsbGD9r-g-CYTqTEDtwJIe9bEaA/viewform?usp=header",
     "Sports quiz": "https://docs.google.com/forms/d/e/1FAIpQLSdBH__Dlx_8CnAWrh3b34b91nCDSeldJVlU7mbooViHGe_sqQ/viewform?usp=header",
     "Swimming": "https://docs.google.com/forms/d/e/1FAIpQLSfe9xa_PorUwZPJ-OoxXteMJtIp2cUmZc-EcHLFiKPou366Zw/viewform?usp=header",

  };
return googleForms[eventName ?? ""] ?? googleForms[slug] ?? null;
}
