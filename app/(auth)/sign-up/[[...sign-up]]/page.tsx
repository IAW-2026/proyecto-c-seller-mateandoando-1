import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <SignUp
      appearance={{
        variables: {
          colorPrimary: "#1B4332", // Forest Green
          colorText: "#121f05", 
          colorBackground: "#FFFFFF", 
          fontFamily: "Inter, sans-serif", 
          borderRadius: "0.25rem", 
        },
        elements: {
          card: "shadow-sm border border-[#E5E2D9] rounded-lg",
          formButtonPrimary: "bg-[#1B4332] hover:bg-[#012d1d] text-white shadow-none",
          socialButtonsBlockButton: "border border-[#BC6C25] text-[#BC6C25] hover:bg-[#F9F7F2]",
          formFieldLabel: "font-semibold text-sm tracking-wide",
        }
      }}
    />
  );
}