import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProviderSettingsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Account settings will be implemented here.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Notification settings will be implemented here.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Business configuration options will be implemented here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
