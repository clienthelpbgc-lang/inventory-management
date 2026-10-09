"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { can } from "@/features/auth/constants/permissions";
import { useAuth } from "@/features/auth/providers/use-auth.provider";
import { CreateReturnDialog } from "@/features/returns/components/create-return-dialog";
import { ReturnList } from "@/features/returns/components/data-table/return-list";

const ReturnsPage = () => {
  const { user } = useAuth();
  const canCreateReturn = !!user && can(user.role, "return:create");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Returns</h1>

          <p className="mt-1 text-muted-foreground">
            Review and approve return requests raised against Outgoings.
          </p>
        </div>

        {canCreateReturn && (
          <CreateReturnDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Return
            </Button>
          </CreateReturnDialog>
        )}
      </div>

      <ReturnList />
    </div>
  );
};

export default ReturnsPage;
