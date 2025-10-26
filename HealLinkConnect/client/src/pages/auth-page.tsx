import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Stethoscope, User, Pill } from "lucide-react";
import { Redirect } from "wouter";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["doctor", "patient", "pharmacy"], { required_error: "Please select a role" }),
  abhaId: z.string().optional(),
  // Profile data fields
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  // Doctor specific
  specialization: z.string().optional(),
  hospital: z.string().optional(),
  licenseNumber: z.string().optional(),
  // Patient specific
  bloodGroup: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  insuranceInfo: z.string().optional(),
});

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string>("");

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      role: undefined,
      name: "",
      phone: "",
      email: "",
    },
  });

  // Redirect if already authenticated
  if (user) {
    if (user.role === 'doctor') return <Redirect to="/doctor" />;
    if (user.role === 'patient') return <Redirect to="/patient" />;
    if (user.role === 'pharmacy') return <Redirect to="/pharmacy" />;
    return <Redirect to="/" />;
  }

  const onLogin = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(data);
  };

  const onRegister = (data: z.infer<typeof registerSchema>) => {
    const { role, name, phone, email, specialization, hospital, licenseNumber, 
            bloodGroup, dateOfBirth, address, emergencyContact, insuranceInfo, ...userData } = data;
    
    let profileData: any = { name, phone, email };
    
    if (role === 'doctor') {
      profileData = { ...profileData, specialization, hospital, licenseNumber };
    } else if (role === 'patient') {
      profileData = { ...profileData, bloodGroup, dateOfBirth, address, emergencyContact, insuranceInfo };
    } else if (role === 'pharmacy') {
      profileData = { ...profileData, address, licenseNumber };
    }
    
    registerMutation.mutate({
      ...userData,
      role,
      profileData
    });
  };

  const roleIcons = {
    doctor: <Stethoscope className="h-6 w-6" />,
    patient: <User className="h-6 w-6" />,
    pharmacy: <Pill className="h-6 w-6" />
  };

  const roleDescriptions = {
    doctor: "Manage patients & prescriptions",
    patient: "Access health records & appointments", 
    pharmacy: "Verify prescriptions & manage stock"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex">
      {/* Left side - Auth forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Heart className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Swashtya Sathi AI</h1>
            <p className="text-muted-foreground">Intelligent healthcare management platform</p>
          </div>

          <Tabs defaultValue="login" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" data-testid="tab-login">Sign In</TabsTrigger>
              <TabsTrigger value="register" data-testid="tab-register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Sign In</CardTitle>
                  <CardDescription>Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter username" {...field} data-testid="input-username" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Enter password" {...field} data-testid="input-password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loginMutation.isPending}
                        data-testid="button-login"
                      >
                        {loginMutation.isPending ? "Signing in..." : "Sign In"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>Register for a new ABHA Health Connect account</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="Choose username" {...field} data-testid="input-register-username" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Create password" {...field} data-testid="input-register-password" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={registerForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <Select onValueChange={(value) => {
                              field.onChange(value);
                              setSelectedRole(value);
                            }} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-role">
                                  <SelectValue placeholder="Select your role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="doctor">
                                  <div className="flex items-center space-x-2">
                                    {roleIcons.doctor}
                                    <div>
                                      <div className="font-medium">Doctor</div>
                                      <div className="text-sm text-muted-foreground">{roleDescriptions.doctor}</div>
                                    </div>
                                  </div>
                                </SelectItem>
                                <SelectItem value="patient">
                                  <div className="flex items-center space-x-2">
                                    {roleIcons.patient}
                                    <div>
                                      <div className="font-medium">Patient</div>
                                      <div className="text-sm text-muted-foreground">{roleDescriptions.patient}</div>
                                    </div>
                                  </div>
                                </SelectItem>
                                <SelectItem value="pharmacy">
                                  <div className="flex items-center space-x-2">
                                    {roleIcons.pharmacy}
                                    <div>
                                      <div className="font-medium">Pharmacy</div>
                                      <div className="text-sm text-muted-foreground">{roleDescriptions.pharmacy}</div>
                                    </div>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter full name" {...field} data-testid="input-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="abhaId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ABHA ID (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter ABHA ID" {...field} data-testid="input-abha-id" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input placeholder="Phone number" {...field} data-testid="input-phone" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="Email address" {...field} data-testid="input-email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Role-specific fields */}
                      {selectedRole === 'doctor' && (
                        <div className="space-y-4 border-t pt-4">
                          <h4 className="font-medium text-foreground">Doctor Information</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={registerForm.control}
                              name="specialization"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Specialization</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., Cardiology" {...field} data-testid="input-specialization" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={registerForm.control}
                              name="hospital"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Hospital</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Hospital name" {...field} data-testid="input-hospital" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={registerForm.control}
                            name="licenseNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Medical License Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="License number" {...field} data-testid="input-license" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}

                      {selectedRole === 'patient' && (
                        <div className="space-y-4 border-t pt-4">
                          <h4 className="font-medium text-foreground">Patient Information</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={registerForm.control}
                              name="bloodGroup"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Blood Group</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., B+" {...field} data-testid="input-blood-group" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={registerForm.control}
                              name="dateOfBirth"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Date of Birth</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} data-testid="input-dob" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={registerForm.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                  <Input placeholder="Full address" {...field} data-testid="input-address" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}

                      {selectedRole === 'pharmacy' && (
                        <div className="space-y-4 border-t pt-4">
                          <h4 className="font-medium text-foreground">Pharmacy Information</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={registerForm.control}
                              name="licenseNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>License Number</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Pharmacy license" {...field} data-testid="input-pharmacy-license" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={registerForm.control}
                              name="address"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Address</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Pharmacy address" {...field} data-testid="input-pharmacy-address" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      )}

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={registerMutation.isPending}
                        data-testid="button-register"
                      >
                        {registerMutation.isPending ? "Creating account..." : "Create Account"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right side - Hero section */}
      <div className="hidden lg:flex lg:flex-1 items-center justify-center bg-gradient-to-br from-primary to-secondary p-8">
        <div className="text-center text-white max-w-md">
          <Heart className="h-20 w-20 mx-auto mb-6 opacity-90" />
          <h2 className="text-4xl font-bold mb-4">Transform Healthcare</h2>
          <p className="text-xl opacity-90 mb-8">
            Seamlessly connect doctors, patients, and pharmacies through ABHA integration
          </p>
          <div className="space-y-4 text-left">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Stethoscope className="h-4 w-4" />
              </div>
              <span>Digital prescription management</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <span>ABHA-linked health records</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Pill className="h-4 w-4" />
              </div>
              <span>Verified medicine dispensation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
