import React, { useState, useEffect } from "react";
import { Text, View, TextInput, Button, StyleSheet, TouchableOpacity } from "react-native";
import { useUser } from "./context/userContext";
import { User } from "./context/user";
import { useRouter } from "expo-router";
import { loginUser } from "./api/auth";


export default function SignInScreen2() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState(""); // Only used in Sign Up mode
  const [message, setMessage] = useState("");
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between Sign In and Sign Up

  let { currentUser, setCurrentUser } = useUser();
  const router = useRouter();

  // Whenever currentUser updates, redirect automatically if a user is logged in.
  useEffect(() => {
    console.log("Current user updated:", currentUser);
    if (currentUser) {
      console.log("Moving to HOME from SignInScreen");
      router.replace("/(tabs)/home");
    }
  }, [currentUser, router]);


  async function sendEmailFromExpo(
    recipientEmail: string,
    code: string
  ) {
    try {
      const response = await fetch('http://18.134.180.224:5000/url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipient_email: recipientEmail,
          code: code
        })
      });

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      const result = await response.json();
      if (response.ok) {
        // console.log('Email sent successfully:', result);
      } else {
        // console.error('Email sending failed:', result);
      }
    } catch (error) {
      // console.error('Error sending email:', error);
    }
  }


  // Dummy function to simulate sending a verification email and verifying it.
  const verifyEmail = async (email: string) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`Verification code for ${email}: ${code}`);
    const htmlContent = "        <div id=\\\"message-content\\\">\
                      <div role=\\\"region\\\">\
                          \
                      </div>\
                      <div role=\\\"region\\\">\
                          <div id=\\\"messagebody\\\"><div class=\\\"message-htmlpart\\\" id=\\\"message-htmlpart1\\\"><!-- html ignored --><!-- head ignored --><!-- meta ignored -->      <!-- meta ignored -->  <!-- meta ignored -->    <!-- meta ignored -->      <style type=\\\"text/css\\\">@media only screen and (min-width: 620px) {      #message-htmlpart1 div.rcmBody .v1u-row { width: 600px !important; }      #message-htmlpart1 div.rcmBody .v1u-row .v1u-col { vertical-align: top; }      #message-htmlpart1 div.rcmBody .v1u-row .v1u-col-100 { width: 600px !important; }    }        @media (max-width: 620px) {      #message-htmlpart1 div.rcmBody .v1u-row-container { max-width: 100% !important; padding-left: 0px !important; padding-right: 0px !important; }      #message-htmlpart1 div.rcmBody .v1u-row .v1u-col { min-width: 320px !important; max-width: 100% !important; display: block !important; }      #message-htmlpart1 div.rcmBody .v1u-row { width: calc(100% - 40px) !important; }      #message-htmlpart1 div.rcmBody .v1u-col { width: 100% !important; }      #message-htmlpart1 div.rcmBody .v1u-col>div { margin: 0 auto; }    }        #message-htmlpart1 div.rcmBody { margin: 0; padding: 0; }        #message-htmlpart1 div.rcmBody table,    #message-htmlpart1 div.rcmBody tr,    #message-htmlpart1 div.rcmBody td { vertical-align: top; border-collapse: collapse; }        #message-htmlpart1 div.rcmBody p { margin: 0; }        #message-htmlpart1 div.rcmBody .v1ie-container table,    #message-htmlpart1 div.rcmBody .v1mso-container table { table-layout: fixed; }        #message-htmlpart1 div.rcmBody * { line-height: inherit; }        #message-htmlpart1 div.rcmBody a[x-apple-data-detectors='true'] { color: inherit !important; text-decoration: none !important; }        #message-htmlpart1 div.rcmBody table,    #message-htmlpart1 div.rcmBody td { color: #000000; }</style>    <link href=\\\"/?_task=utils&amp;_action=modcss&amp;_u=tmp-d904cd2183ebd16b9e358ff87aa7603c.css&amp;_c=message-htmlpart1\\\" rel=\\\"stylesheet\\\" type=\\\"text/css\\\">  <div class=\\\"rcmBody\\\" class=\\\"v1clean-body v1u_body\\\" style=\\\"margin: 0; padding: 0; -webkit-text-size-adjust: 100%; background-color: #e7e7e7; color: #000000\\\">      <table style=\\\"border-collapse: collapse; table-layout: fixed; border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; vertical-align: top; min-width: 320px; margin: 0 auto; background-color: #e7e7e7; width: 100%\\\" cellpadding=\\\"0\\\" cellspacing=\\\"0\\\">    <tbody>      <tr style=\\\"vertical-align: top\\\">        <td style=\\\"word-break: break-word; border-collapse: collapse !important; vertical-align: top\\\">                    <div class=\\\"v1u-row-container\\\" style=\\\"padding: 0px; background-color: transparent\\\">            <div class=\\\"v1u-row\\\" style=\\\"margin: 0 auto; min-width: 320px; max-width: 600px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: #ffffff\\\">              <div style=\\\"border-collapse: collapse; display: table; width: 100%; background-color: transparent\\\">                                                <div class=\\\"v1u-col v1u-col-100\\\" style=\\\"max-width: 320px; min-width: 600px; display: table-cell; vertical-align: top\\\">                  <div style=\\\"width: 100% !important\\\">                                        <div style=\\\"padding: 0px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-right: 0px solid transparent; border-bottom: 0px solid transparent\\\">                                            <table style=\\\"font-family: 'Cabin',sans-serif\\\" cellpadding=\\\"0\\\" cellspacing=\\\"0\\\" width=\\\"100%\\\" border=\\\"0\\\">                        <tbody>                          <tr>                            <td style=\\\"overflow-wrap: break-word; word-break: break-word; padding: 20px; font-family: 'Cabin',sans-serif\\\" align=\\\"left\\\">                              <table width=\\\"100%\\\" cellpadding=\\\"0\\\" cellspacing=\\\"0\\\" border=\\\"0\\\">                                <tr>                                                                     <td style=\\\"padding-right: 0px; padding-left: 0px\\\" align=\\\"left\\\">\
                    <span style=\\\"font-size: 40px; font-family: sans-serif;\\\">Breezy</span>\
                  </td>                                 </td>                                </tr>                              </table>                            </td>                          </tr>                        </tbody>                      </table>                                          </div>                                      </div>                </div>                                              </div>            </div>          </div>          <div class=\\\"v1u-row-container\\\" style=\\\"padding: 0px; background-color: transparent\\\">            <div class=\\\"v1u-row\\\" style=\\\"margin: 0 auto; min-width: 320px; max-width: 600px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: #0a0a0a\\\">              <div style=\\\"border-collapse: collapse; display: table; width: 100%; background-color: transparent\\\">                                                <div class=\\\"v1u-col v1u-col-100\\\" style=\\\"max-width: 320px; min-width: 600px; display: table-cell; vertical-align: top\\\">                  <div style=\\\"width: 100% !important\\\">                                        <div style=\\\"padding: 0px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-right: 0px solid transparent; border-bottom: 0px solid transparent\\\">                                            <table style=\\\"font-family: 'Cabin',sans-serif\\\" cellpadding=\\\"0\\\" cellspacing=\\\"0\\\" width=\\\"100%\\\" border=\\\"0\\\">                        <tbody>                          <tr>                            <td style=\\\"overflow-wrap: break-word; word-break: break-word; padding: 10px; font-family: 'Cabin',sans-serif\\\" align=\\\"left\\\">                              <h2 style=\\\"margin: 0px; color: #ffffff; line-height: 200%; text-align: center; word-wrap: break-word; font-weight: normal; font-family: 'Cabin',sans-serif; font-size: 30px\\\">                                <strong>Your Authentication Code</strong>\
                                        </h2>\
                                      </td>                          </tr>                        </tbody>                      </table>                                          </div>                                      </div>                </div>                                              </div>            </div>          </div>          <div class=\\\"v1u-row-container\\\" style=\\\"padding: 0px; background-color: transparent\\\">            <div class=\\\"v1u-row\\\" style=\\\"margin: 0 auto; min-width: 320px; max-width: 600px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: #ffffff\\\">              <div style=\\\"border-collapse: collapse; display: table; width: 100%; background-color: transparent\\\">                                                <div class=\\\"v1u-col v1u-col-100\\\" style=\\\"max-width: 320px; min-width: 600px; display: table-cell; vertical-align: top\\\">                  <div style=\\\"width: 100% !important\\\">                                        <div style=\\\"padding: 0px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-right: 0px solid transparent; border-bottom: 0px solid transparent\\\">                                            <table style=\\\"font-family: 'Cabin',sans-serif\\\" cellpadding=\\\"0\\\" cellspacing=\\\"0\\\" width=\\\"100%\\\" border=\\\"0\\\">                        <tbody>                          <tr>                            <td style=\\\"overflow-wrap: break-word; word-break: break-word; padding: 33px 55px; font-family: 'Cabin',sans-serif\\\" align=\\\"left\\\">                              <div style=\\\"line-height: 160%; text-align: center; word-wrap: break-word\\\">                                <b><p style=\\\"font-size: 14px; line-height: 160%\\\"><span style=\\\"font-size: 35px; line-height: 70.4px\\\"> 696969 </span></p></b>\
                                        </div>\
                                      </td>                          </tr>                        </tbody>                      </table>                                          </div>                                      </div>                </div>                                              </div>            </div>          </div>          <div class=\\\"v1u-row-container\\\" style=\\\"padding: 0px; background-color: transparent\\\">            <div class=\\\"v1u-row\\\" style=\\\"margin: 0 auto; min-width: 320px; max-width: 600px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: #e5eaf5\\\">              <div style=\\\"border-collapse: collapse; display: table; width: 100%; background-color: transparent\\\">                                                <div class=\\\"v1u-col v1u-col-100\\\" style=\\\"max-width: 320px; min-width: 600px; display: table-cell; vertical-align: top\\\">                  <div style=\\\"width: 100% !important\\\">                                        <div style=\\\"padding: 0px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-right: 0px solid transparent; border-bottom: 0px solid transparent\\\">                                            <table style=\\\"font-family: 'Cabin',sans-serif\\\" cellpadding=\\\"0\\\" cellspacing=\\\"0\\\" width=\\\"100%\\\" border=\\\"0\\\">                        <tbody>                          <tr>                            <td style=\\\"overflow-wrap: break-word; word-break: break-word; padding: 41px 55px 18px; font-family: 'Cabin',sans-serif\\\" align=\\\"left\\\">                              <div style=\\\"color: #0a0a0a; line-height: 160%; text-align: center; word-wrap: break-word\\\">                                <p style=\\\"font-size: 14px; line-height: 160%\\\"><span style=\\\"font-size: 20px; line-height: 32px\\\"><strong>Didn't request this?</strong></span></p>                                <p style=\\\"font-size: 14px; line-height: 160%\\\"><span style=\\\"font-size: 16px; line-height: 25.6px; color: #000000\\\">Please ignore this email</span></p>                                <p style=\\\"line-height: 160%; font-size: 14px\\\"> </p>                              </div>\
                                      </td>                          </tr>                        </tbody>                      </table>                                          </div>                                      </div>                </div>                                              </div>            </div>          </div>          <div class=\\\"v1u-row-container\\\" style=\\\"padding: 0px; background-color: transparent\\\">            <div class=\\\"v1u-row\\\" style=\\\"margin: 0 auto; min-width: 320px; max-width: 600px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: #0a0a0a\\\">              <div style=\\\"border-collapse: collapse; display: table; width: 100%; background-color: transparent\\\">                                                <div class=\\\"v1u-col v1u-col-100\\\" style=\\\"max-width: 320px; min-width: 600px; display: table-cell; vertical-align: top\\\">                  <div style=\\\"width: 100% !important\\\">                                        <div style=\\\"padding: 0px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-right: 0px solid transparent; border-bottom: 0px solid transparent\\\">                                            <table style=\\\"font-family: 'Cabin',sans-serif\\\" cellpadding=\\\"0\\\" cellspacing=\\\"0\\\" width=\\\"100%\\\" border=\\\"0\\\">                        <tbody>                          <tr>                            <td style=\\\"overflow-wrap: break-word; word-break: break-word; padding: 10px; font-family: 'Cabin',sans-serif\\\" align=\\\"left\\\">                              <div style=\\\"color: #fafafa; line-height: 180%; text-align: center; word-wrap: break-word\\\">                                <p style=\\\"font-size: 14px; line-height: 180%\\\"><span style=\\\"font-size: 16px; line-height: 28.8px\\\">Breezy 2025</span></p>                              </div>\
                                      </td>                          </tr>                        </tbody>                      </table>                                          </div>                                      </div>                </div>                                              </div>            </div>          </div>                  </td>      </tr>    </tbody>  </table>    </div></div></div>\
                      </div>\
                  </div>\
                  </div>";

    
    sendEmailFromExpo(email, code);
    return code;
    // TODO complete
  };

  const handleSignIn = async () => {
    setMessage(""); // Reset message

    if (!isSignUp) {

      try {
        // Simulate email verification
        // TODO: Verify this email exists in the database
        // If it does, get the login. If not, show an error message.
        
        const userData = await loginUser(email);
        console.log(userData); 
        if (userData === null) {
          setMessage("Account does not exist. Please sign up instead.");
          return;
        } else {
          const code = await verifyEmail(email);
          const route: `/emailVerification?${string}` = `/emailVerification?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}&username=${encodeURIComponent(userData.name)}&signIn=${encodeURIComponent(true)}&id=${encodeURIComponent(userData.id)}`;
          router.replace(route);

        }
      } catch (error) {
        console.error("Error during sign in:", error);
        setMessage("Error during email verification.");
      }
    } else {
      // Sign Up Logic
      
      // Check that user already exists
      const userdata = await loginUser(email);
      if (userdata !== null) {
        setMessage("Account already exists. Please log in instead.");
        return;
      }

      if (username.trim() === "") {
        setMessage("Please enter a username.");
        return;
      }

      try {
        const code = await verifyEmail(email);
        console.log("Username Set as", username)
        const route: `/emailVerification?${string}` =
        `/emailVerification?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}&username=${encodeURIComponent(username)}&signIn=${encodeURIComponent(false)}&id=${encodeURIComponent("test")}`;
          router.replace(route); 
        
        
      } catch (error) {
        console.error("Error during sign up:", error);
        setMessage("Error during email verification.");
      }
    }
  };

  // If a user is already logged in, don't render the sign in UI.
  if (currentUser) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isSignUp ? "Create Account" : "Sign In"}</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        onChangeText={setEmail}
        value={email}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {/* Render the Username field only in Sign Up mode */}
      {isSignUp && (
        <TextInput
          style={styles.input}
          placeholder="Username"
          onChangeText={setUsername}
          value={username}
          autoCapitalize="none"
        />
      )}
      <Button title={isSignUp ? "Sign Up" : "Sign In"} onPress={handleSignIn} />
      {message !== "" && <Text style={styles.message}>{message}</Text>}
      <TouchableOpacity onPress={() => { setIsSignUp(!isSignUp); setMessage(""); }}>
        <Text style={styles.toggleText}>
          {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
    width: "100%",
  },
  message: {
    marginTop: 10,
    color: "red",
  },
  toggleText: {
    marginTop: 15,
    color: "blue",
    textDecorationLine: "underline",
  },
});
