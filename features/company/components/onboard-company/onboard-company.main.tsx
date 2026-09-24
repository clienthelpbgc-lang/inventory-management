"use client";

import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckIcon,
  LoaderCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  SendIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  Stepper,
  StepperContent,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/reui/stepper";

import { Button } from "@/components/ui/button";

import { OnboardCompanyType } from "../../types/company.type";
import { onBoardCompanySchema } from "../../validations/company.validation";
import { onBoardCompanyDefaultValues } from "../../constants/onboard-company-default";

import CompanyForm from "./company-step";
import UsersForm from "./users-step";

import { useOnboardCompany } from "../../hooks/use-onboard-company";

const STEPS = [
  { step: 1, title: "Company Details" },
  { step: 2, title: "Users" },
] as const;

type Step = (typeof STEPS)[number]["step"];

export default function AddCompanyMain() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isNavigating, setIsNavigating] = useState(false);

  const router = useRouter();

  const { onboardCompany, isSubmitting } = useOnboardCompany();

  const form = useForm<OnboardCompanyType>({
    resolver: zodResolver(onBoardCompanySchema),
    defaultValues: onBoardCompanyDefaultValues,
    mode: "onTouched",
  });

  const handleNext = async () => {
    setIsNavigating(true);

    try {
      let valid = true;

      if (currentStep === 1) {
        valid = await form.trigger("company");
      }

      if (valid) {
        setCurrentStep((s) => (s < STEPS.length ? ((s + 1) as Step) : s));
      }
    } finally {
      setIsNavigating(false);
    }
  };

  const handleBack = () => {
    setCurrentStep((s) => (s > 1 ? ((s - 1) as Step) : s));
  };

  const handleSubmit = async () => {
    try {
      const isValid = await form.trigger();

      if (!isValid) {
        if (form.formState.errors.company) {
          setCurrentStep(1);
        } else {
          setCurrentStep(2);
        }

        toast.error("Please fix the validation errors.");
        return;
      }

      await onboardCompany(form.getValues());

      toast.success("Company onboarded successfully.");

      // router.push("/admin");
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error ? error.message : "Failed to onboard company.",
      );
    }
  };

  return (
    <FormProvider {...form}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Onboard client</h1>
          <p className="mt-1 text-muted-foreground">
            Create a new company and its users.
          </p>
        </div>

        {/* Progress */}
        <div className="rounded-2xl border bg-gradient-to-br from-background to-muted/40 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">
                Step {currentStep} of {STEPS.length}
              </p>

              <p className="text-sm text-muted-foreground">
                {STEPS[currentStep - 1].title}
              </p>
            </div>

            <div className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              {Math.round((currentStep / STEPS.length) * 100)}% Complete
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="overflow-hidden rounded-3xl border bg-card shadow-xl">
          <Stepper
            value={currentStep}
            indicators={{
              completed: <CheckIcon className="size-3.5" />,
              loading: <LoaderCircleIcon className="size-3.5 animate-spin" />,
            }}
            className="space-y-8 p-6 md:p-8"
          >
            {/* Stepper */}
            <div className="border-b bg-muted/20 pb-6">
              <div className="flex justify-center">
                <StepperNav className="w-full max-w-2xl">
                  {STEPS.map(({ step, title }) => (
                    <StepperItem key={step} step={step}>
                      <StepperTrigger
                        className="gap-2"
                        onClick={() =>
                          step < currentStep && setCurrentStep(step)
                        }
                        disabled={step > currentStep}
                      >
                        <StepperIndicator>{step}</StepperIndicator>

                        <StepperTitle>{title}</StepperTitle>
                      </StepperTrigger>

                      {step < STEPS.length && (
                        <StepperSeparator className="bg-primary/20 group-data-[state=completed]/step:bg-primary" />
                      )}
                    </StepperItem>
                  ))}
                </StepperNav>
              </div>
            </div>

            {/* Step Content */}
            <StepperPanel className="text-sm">
              <StepperContent
                value={1}
                className="rounded-2xl border bg-background p-6 md:p-8"
              >
                <CompanyForm />
              </StepperContent>

              <StepperContent
                value={2}
                className="rounded-2xl border bg-background p-6 md:p-8"
              >
                <UsersForm form={form} />
              </StepperContent>
            </StepperPanel>
          </Stepper>
        </div>

        {/* Footer */}
        <div className="sticky bottom-4 z-10 flex items-center justify-between rounded-2xl border bg-background/95 p-4 shadow-2xl backdrop-blur">
          <Button
            variant="outline"
            size="lg"
            onClick={handleBack}
            disabled={currentStep === 1 || isSubmitting || isNavigating}
            className="gap-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </Button>

          {currentStep < STEPS.length ? (
            <Button
              size="lg"
              onClick={handleNext}
              disabled={isSubmitting || isNavigating}
            >
              {isNavigating ? (
                <LoaderCircleIcon className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRightIcon className="h-4 w-4" />
              )}

              {isNavigating ? "Validating..." : "Next"}
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="gap-2 bg-gradient-to-r from-emerald-600 to-green-600"
            >
              {isSubmitting ? (
                <LoaderCircleIcon className="h-4 w-4 animate-spin" />
              ) : (
                <SendIcon className="h-4 w-4" />
              )}

              {isSubmitting ? "Submitting..." : "Onboard Company"}
            </Button>
          )}
        </div>
      </div>
    </FormProvider>
  );
}
