import nodemailer from 'nodemailer';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Cấu hình transporter cho nodemailer sử dụng Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // Sử dụng App Password thay vì mật khẩu thông thường
  }
});

export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const generatePasswordResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const sendVerificationEmail = async (userEmail, verificationToken) => {
  try {
    const verificationUrl = `${process.env.FRONTEND_URL}/dang-ky/verify-email?token=${verificationToken}`;
    
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    // Trong môi trường development, in ra link xác thực vào console
    if (isDevelopment) {
      console.log(`[DEV MODE] Gửi email xác thực đến: ${userEmail}`);
      console.log(`[DEV MODE] Link xác thực: ${verificationUrl}`);
    }
    
    const mailOptions = {
      from: `"PhongTroVN" <${process.env.GMAIL_USER}>`,
      to: userEmail,
      subject: 'Xác thực tài khoản PhongTroVN',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563EB;">Xác thực tài khoản của bạn</h1>
          <p>Cảm ơn bạn đã đăng ký tài khoản tại PhongTroVN.</p>
          <p>Vui lòng click vào link bên dưới để xác thực tài khoản:</p>
          <a href="${verificationUrl}" 
             style="display: inline-block; 
                    background-color: #2563EB; 
                    color: white; 
                    padding: 10px 20px; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    margin: 15px 0;">
            Xác thực tài khoản
          </a>
          <p style="color: #666;">Link xác thực sẽ hết hạn sau 24 giờ.</p>
          <p style="color: #666;">Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.</p>
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
            <small style="color: #666;">Email này được gửi tự động, vui lòng không trả lời.</small>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    // Hiển thị thông tin lỗi chi tiết
    if (error.response) {
      console.error('SMTP response code:', error.response);
    }
    return false;
  }
};

export const sendPasswordResetEmail = async (userEmail, resetToken) => {
  try {
    console.log(`Attempting to send password reset email to: ${userEmail}`);
    const resetUrl = `${process.env.FRONTEND_URL}/quen-mat-khau/reset?token=${resetToken}`;
    
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    // Trong môi trường development, in ra link reset vào console
    if (isDevelopment) {
      console.log(`[DEV MODE] Gửi email đặt lại mật khẩu đến: ${userEmail}`);
      console.log(`[DEV MODE] Link đặt lại mật khẩu: ${resetUrl}`);
    }
    
    const mailOptions = {
      from: `"PhongTroVN" <${process.env.GMAIL_USER}>`,
      to: userEmail,
      subject: 'Đặt lại mật khẩu - PhongTroVN',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #DC2626;">Yêu cầu đặt lại mật khẩu</h1>
          <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại PhongTroVN.</p>
          <p>Vui lòng click vào link bên dưới để đặt lại mật khẩu:</p>
          <a href="${resetUrl}" 
             style="display: inline-block; 
                    background-color: #DC2626; 
                    color: white; 
                    padding: 10px 20px; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    margin: 15px 0;">
            Đặt lại mật khẩu
          </a>
          <p style="color: #666;">Link đặt lại mật khẩu sẽ hết hạn sau 1 giờ.</p>
          <p style="color: #666;"><strong>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. Mật khẩu của bạn sẽ không thay đổi.</strong></p>
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
            <small style="color: #666;">Vì lý do bảo mật, email này được gửi tự động. Vui lòng không trả lời.</small>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully to', userEmail, ':', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending password reset email to', userEmail, ':', error);
    
    // Hiển thị thông tin lỗi chi tiết
    if (error.response) {
      console.error('SMTP response code:', error.response);
    }
    
    console.error('Error stack:', error.stack);
    return false;
  }
};