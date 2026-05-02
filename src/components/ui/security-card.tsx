"use client";
import { cn } from "../../lib/utils";
import React, { useEffect, useRef, useState } from "react";
import { IoMdCheckmark } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";

type SecurityCardProps = {
  delay?: number;
  name?: string;
  email?: string;
  className?: string;
};

const SecurityCard = ({
  delay = 5000,
  name = "Liam Parker",
  email = "liam.parker@example.com",
  className,
}: SecurityCardProps) => {
  const [animationKey, setAnimationKey] = useState(0);
  const delayTime = Math.max(delay, 5000);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationKey((prev) => prev + 1);
    }, delayTime);

    return () => clearInterval(interval);
  }, [delayTime]);

  return (
    <div className={cn("w-full flex justify-center", className)}>
      <AnimatePresence mode="wait">
        <SecuritycardInner name={name} email={email} key={animationKey} />
      </AnimatePresence>
    </div>
  );
};

interface InnerProps {
  name: string;
  email: string;
  key?: React.Key;
}

const SecuritycardInner = ({ name, email }: InnerProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className={cn(
        "relative overflow-hidden",
        "flex h-[24rem] w-full max-w-[320px] items-center justify-center",
        "rounded-2xl border border-white/10 bg-black",
        "shadow-2xl",
      )}
    >
      <InfiniteScrambler />
      <ContainerMask />
      
      {/* Bottom Glow */}
      <div
        className={cn(
          "absolute bottom-0 h-1/2 w-[150%] rounded-t-[60%]",
          "bg-gradient-to-b from-blue-500/10 to-transparent shadow-[0_0_100px_rgba(78,99,255,0.2)]",
        )}
      />

      {/* User Info Overlay */}
      <div className="absolute top-[75%] flex h-12 w-full flex-col items-center justify-center gap-1 z-20">
        <div className="flex items-center justify-center text-xs font-medium text-white">
          <motion.p
            initial={{ x: 8, opacity: 0 }}
            animate={{ x: -2, opacity: 1 }}
            transition={{
              duration: 0.4,
              ease: "easeInOut",
              delay: 1.8,
            }}
          >
            {name}
          </motion.p>
          <CheckCircle />
        </div>
        <div className="text-[10px] text-white/40 font-light">{email}</div>
      </div>

      {/* Face ID Card */}
      <div className="relative rounded-xl bg-white/5 p-1 backdrop-blur-sm border border-white/10 z-10">
        <div className="relative h-28 w-20 rounded-lg bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center overflow-hidden">
          <FaceCard />
          
          {/* Scanning Line */}
          <motion.div 
            className="absolute left-0 right-0 h-[1px] bg-cyan-400 shadow-[0_0_10px_#06b6d4] z-20"
            initial={{ top: "0%" }}
            animate={{ top: "100%" }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>
      </div>

      {/* Top Vignette */}
      <div className="absolute left-0 top-0 h-[150px] w-full bg-gradient-to-b from-black via-black/80 to-transparent z-0" />

      {/* Header Info */}
      <div className="absolute left-0 top-6 w-full px-5 z-10">
        <h3 className="text-sm font-semibold text-white tracking-tight">
          Smart Access Control
        </h3>
        <p className="mt-1.5 text-[10px] text-white/50 leading-relaxed font-light">
          Evaluate each login based on real-time signals like IP, device
          history, and context before allowing access intelligently.
        </p>
      </div>
    </motion.div>
  );
};

const FaceCard = () => {
  return (
    <svg
      viewBox="0 0 80 96"
      fill="none"
      className="absolute inset-0 h-full w-full p-4"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    >
      <path
        d="M26.22 78.25c2.679-3.522 1.485-17.776 1.485-17.776-1.084-2.098-1.918-4.288-2.123-5.619-3.573 0-3.7-8.05-3.827-9.937-.102-1.509 1.403-1.383 2.169-1.132-.298-1.3-.92-5.408-1.021-11.446C22.775 24.794 30.94 17.75 40 17.75h.005c9.059 0 17.225 7.044 17.097 14.59-.102 6.038-.723 10.147-1.021 11.446.765-.251 2.271-.377 2.169 1.132-.128 1.887-.254 9.937-3.827 9.937-.205 1.331-1.039 3.521-2.123 5.619 0 0-1.194 14.254 1.485 17.776"
        className="stroke-white/10"
      ></path>
      <path
        d="M27.705 60.474a26.884 26.884 0 0 0 1.577 2.682c1.786 2.642 5.36 6.792 10.718 6.792h.005c5.358 0 8.932-4.15 10.718-6.792a26.884 26.884 0 0 0 1.577-2.682"
        className="stroke-white/10"
      />
      <path
        d="M26.22 78.25c2.679-3.522 1.485-17.776 1.485-17.776-1.084-2.098-1.918-4.288-2.123-5.619-3.573 0-3.7-8.05-3.827-9.937-.102-1.509 1.403-1.383 2.169-1.132-.298-1.3-.92-5.408-1.021-11.446C22.775 24.794 30.94 17.75 40 17.75h.005c9.059 0 17.225 7.044 17.097 14.59-.102 6.038-.723 10.147-1.021 11.446.765-.251 2.271-.377 2.169 1.132-.128 1.887-.254 9.937-3.827 9.937-.205 1.331-1.039 3.521-2.123 5.619 0 0-1.194 14.254 1.485 17.776"
        className="animate-[draw-outline_2s_ease-in-out_infinite] stroke-[#06b6d4] [filter:drop-shadow(0_0_6px_#06b6d4)]"
      ></path>
      <path
        d="M27.705 60.474a26.884 26.884 0 0 0 1.577 2.682c1.786 2.642 5.36 6.792 10.718 6.792h.005c5.358 0 8.932-4.15 10.718-6.792a26.884 26.884 0 0 0 1.577-2.682"
        className="animate-[draw_2s_ease-in-out_infinite] stroke-[#06b6d4] [filter:drop-shadow(0_0_6px_#06b6d4)]"
      />
    </svg>
  );
};

const CheckCircle = () => {
  return (
    <div className="relative ml-1">
      <svg width="14" height="14" viewBox="0 0 18 18">
        <motion.circle
          cx="9"
          cy="9"
          r="6"
          fill="#06b6d4"
          className="rounded-full [filter:drop-shadow(0_0_2px_#06b6d4)]"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.3,
            delay: 2.3,
          }}
        />
      </svg>
      <motion.div
        className="absolute inset-0 flex items-center justify-center text-black"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.3,
          delay: 2.4,
        }}
      >
        <IoMdCheckmark size={10} />
      </motion.div>
    </div>
  );
};

const SCRAMBLED_STRINGS = [
  "6*7A0^!HIETD@6XS749%2$4L4RO$SH*8W#6OPLLF%WSKVI^PTT1PJUOS60EQL$*K53*Y#AK5GDM6XIWX79XR^DQOMEJF$F1ZNL*L0Z&#LJ4B$E97Q76VF0U#HY!37J5$GKCI0RMK$2P1F9JJYGVR@IAHYPZALXQMJ!519!GZTQSA$#BEXUYPSZ302Z*&DDWW!NI61S#!MAHJ0Y&3J8*EBIMM$#X%46NJ0*9P3L@UW5A8NCZX&98CQ75NL9XEH11NBB^E&LQ1YPZALMJ3DSUXBS9*DADQ7ND0SCI#HY!37J5$GKKAUGDYE@#8CBDUFA9#3EYGVR@IAHZCUKIYPZALX#3EYZX&98CQ75NL9XJ4B$E97Q76VF0LKU8S5KVSD9$#BEX2Z9HSABIU#CSDK@SN!",
  "Y4#!I*ZO1QCFU07QJFDVW#6$17$WW^#7MR5Q50I^2FFKJQW1&1%94ABU&$TX$RRTXT3P!4JPK3^A12&DQ15S08%Q^X*GUE761@6S5DA*HACX9@AS3B04YQ5*VD1*$XX9ECF4B9%O^^LGNDKT%FT2Y2SDC0M!GCNSPVWVNBAWEPT3Q2XK6M877&Q838ZWKGW8*SVG241H51EB2SU1QZL56OR44Q$95ZEDFOVS#AL@C%FEYKZEPI*F&EQUT^65O68J3Q9O^YACNTNVMAK4S#MRM!V@GOKPV0HO2IN$3501P^Y9K3UJ9%LFHMQTJK49A@&84HNFS9IYB@KMEBHIWPSD06$XL8@1A*5OMD!XW8#N7F&MM9R%6E&V&L$^J$8YMANP2TSIP3POYC!I!EER#JBFF",
  "4HM5$8&ZBKCL0G$2ZE7OAZHBUDZXDJW81WD7YDH7##HO7VM84J&@&PV^7YACYLRBWI2HDUW9@!I#H@3%HN%AD@!ED0FOPL#4N8X%LO31#T9N1!HWCAP9DY!KQ5AEMFLF6#DK#4AX70^HXSGH2Y1XJCALNF5XYZ0L28%THU@X&83MKC4R%LZ1J8B86NW1Z$Q8^6J6FP&%PXQ7#LUHV21UM^3K%LYDYO2KWZT!3&WB51UJXJ2Y8!$D7G54RUZEI78^G&1MD%8*5NGKU201%G@FY@CE8$4BG!YEBNCR0YLP@D!W@EU*3II2U8N^9*XZD^^R0BHBP7$7HV0P8F$!XVGWULL4YUDH#MQLQQE8A1&UW0HG42^SVEE3PP9XLURVKU8$OZ!0DV0X!@NHGNFG!I9KF",
  "IZE$@GCC&9OEB%@LLRX%IJ!VILBQ$%K#XALOTXTQD1%J82QSFUS512FRQHSO@#R#MK0C0@686S$XS1EPS0YLQ!%TL374LL#Y@DL4&1G85XA6S59K99DWZ8@LEVWAK94Y99VDSXS^V$71J092U2V#AB*@*45AZXIGVM^08V1&F1#!ST5PP7WBR*RE1SZ%UCJNMHP#^DJ0O1JAZIGPB7%V7DBQ^CKZ^6B^Q510BMK8Y3TA&@HZAHYCMG1J9Y1FOQ2TS3M$A@R%5^X$71W@N@%&W100&7768Q3!8V2F6K8#R^X!3VZ^GUHQ#3%BUSASCQL1#C4#AJ5RQJ1ITY%CZVD$$EZP!QRML2FOU%M9OH#17#I&H4SLS8U0E9%L^MDYEWYCUL*RXKYHKB$A7PZ10AB6^",
];

const InfiniteScrambler = () => {
  const [text, setText] = useState(SCRAMBLED_STRINGS[0]);
  const index = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      index.current = (index.current + 1) % SCRAMBLED_STRINGS.length;
      setText(SCRAMBLED_STRINGS[index.current]);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-[15%] max-w-[280px] z-0">
      <p className="leading-tight whitespace-normal break-words font-mono text-[10px] text-white/10 select-none">
        {text}
      </p>
    </div>
  );
};

const ContainerMask = () => {
  return (
    <>
      <div className="absolute left-0 top-0 h-full w-[60px] bg-gradient-to-r from-black to-transparent z-10" />
      <div className="absolute right-0 top-0 h-full w-[60px] bg-gradient-to-l from-black to-transparent z-10" />
    </>
  );
};

export default SecurityCard;
