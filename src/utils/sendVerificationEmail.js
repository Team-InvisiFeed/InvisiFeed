import sendOTP from "@/utils/otpMailer";

const sendVerificationEmail = async (email, otp) => {
  try {
    const subject = "Verify your email";
    const message = `Your verification code is: ${otp}. It will expire in 1 hour.`;

    await sendOTP(email, subject, message);

    return {
      success: true,
      message: "OTP sent successfully",
    };
  } catch (error) {
    console.error("Error sending OTP:", error);

    return {
      success: false,
      message: "Failed to send OTP",
    };
  }
};

export default sendVerificationEmail;
