import { Resend } from 'resend';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const sendVerificationEmail = async (userEmail, verificationToken) => {
  try {
    // Kiểm tra API key
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY not found in environment variables');
      return false;
    }

    const verificationUrl = `${process.env.FRONTEND_URL}/dang-ky/verify-email?token=${verificationToken}`;
    
    console.log('Sending verification email to:', userEmail);
    console.log('Verification URL:', verificationUrl);
    
    const { data, error } = await resend.emails.send({
      from: 'PhongTroVN <onboarding@resend.dev>',
      to: userEmail,
      subject: 'Xác thực tài khoản PhongTroVN',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color:~2563EB;">Xác thực tài khoản của bạn</h1>
          <p>Cảm ơn bạn đã đăng ký tài khoản tại PhongTroVN.</p>
          <p>Vui lòng click vào link bên dưới để xác thực tài khoản:</p>
          <a href="${verificationUrl}" 
             style="display: inline-block; 
                    background-color:~2563EB; 
                    color: white; 
                    padding: 10px 20px; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    margin: 15px 0;">
            Xác thực tài khoản
          </a>
          <p style="color:~666;">Link xác thực sẽ hết hạn sau 24 giờ.</p>
          <p style="color:~666;">Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.</p>
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid~eee;">
            <small style="color:~666;">Email này được gửi tự động, vui lòng không trả lời.</small>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('Resend API Error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return false;
    }

    console.log('Verification email sent successfully:', data);
    console.log('Email ID:', data.id);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    console.error('Error stack:', error.stack);
    return false;
  }
};