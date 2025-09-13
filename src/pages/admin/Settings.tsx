import AdminLayout from "@/components/admin/AdminLayout";
import BackupManagement from "@/components/admin/BackupManagement";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

const Settings = () => {



  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Database Backup Management</h1>
          <p className="text-muted-foreground">
            Manage database backups and system maintenance
          </p>
        </div>

        <div className="space-y-6">
          <BackupManagement />
        </div>
      </div>
    </AdminLayout>
  );
};

export default Settings;
