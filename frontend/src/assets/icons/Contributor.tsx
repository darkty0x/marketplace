interface Props {
  className?: string;
}

export default function Contributor({ className }: Props) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg height="100%" viewBox="0 0 12 15" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.3334 14.6666H10.0001V13.3333C10.0001 12.8029 9.78937 12.2942 9.41429 11.9191C9.03922 11.544 8.53051 11.3333 8.00008 11.3333H4.00008C3.46965 11.3333 2.96094 11.544 2.58587 11.9191C2.2108 12.2942 2.00008 12.8029 2.00008 13.3333V14.6666H0.666748V13.3333C0.666748 12.4492 1.01794 11.6014 1.64306 10.9763C2.26818 10.3511 3.11603 9.99996 4.00008 9.99996H8.00008C8.88414 9.99996 9.73198 10.3511 10.3571 10.9763C10.9822 11.6014 11.3334 12.4492 11.3334 13.3333V14.6666ZM6.00008 8.66663C5.47479 8.66663 4.95465 8.56316 4.46935 8.36214C3.98405 8.16113 3.54309 7.86649 3.17165 7.49505C2.80022 7.12362 2.50558 6.68266 2.30456 6.19736C2.10354 5.71206 2.00008 5.19191 2.00008 4.66663C2.00008 4.14134 2.10354 3.62119 2.30456 3.13589C2.50558 2.65059 2.80022 2.20963 3.17165 1.8382C3.54309 1.46676 3.98405 1.17213 4.46935 0.971108C4.95465 0.770089 5.47479 0.666626 6.00008 0.666626C7.06095 0.666626 8.07836 1.08805 8.82851 1.8382C9.57865 2.58834 10.0001 3.60576 10.0001 4.66663C10.0001 5.72749 9.57865 6.74491 8.82851 7.49505C8.07836 8.2452 7.06095 8.66663 6.00008 8.66663V8.66663ZM6.00008 7.33329C6.70733 7.33329 7.3856 7.05234 7.8857 6.55224C8.3858 6.05215 8.66675 5.37387 8.66675 4.66663C8.66675 3.95938 8.3858 3.2811 7.8857 2.78101C7.3856 2.28091 6.70733 1.99996 6.00008 1.99996C5.29284 1.99996 4.61456 2.28091 4.11446 2.78101C3.61437 3.2811 3.33341 3.95938 3.33341 4.66663C3.33341 5.37387 3.61437 6.05215 4.11446 6.55224C4.61456 7.05234 5.29284 7.33329 6.00008 7.33329V7.33329Z" />
      </svg>
    </div>
  );
}