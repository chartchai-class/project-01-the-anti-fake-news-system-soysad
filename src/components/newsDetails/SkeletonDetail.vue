<template>
  <div class="mx-auto max-w-screen-2xl px-6 sm:px-8 lg:px-12 py-10">
    <article
      class="relative bg-white/70 backdrop-blur rounded-[28px] ring-1 ring-black/5 shadow-sm overflow-hidden"
    >
      <!-- Header -->
      <div class="px-8 lg:px-12 pt-10 pb-6">
        <div class="animate-pulse space-y-3">
          <div class="h-10 w-5/6 bg-zinc-200 rounded"></div>
          <div class="h-4 w-2/5 bg-zinc-200 rounded"></div>

          <div class="mt-2 flex items-center gap-3">
            <div class="h-4 w-28 bg-zinc-200 rounded"></div>
            <div class="h-4 w-6 bg-zinc-200 rounded"></div>
            <div class="h-4 w-40 bg-zinc-200 rounded"></div>
            <div class="ml-auto h-12 w-12 rounded-full bg-zinc-200 ring-1 ring-black/5"></div>
          </div>
        </div>
      </div>

      <!-- Hero image -->
      <div class="px-6 sm:px-8 lg:px-12">
        <div
          class="aspect-[16/9] w-full rounded-2xl md:rounded-3xl bg-zinc-200 animate-pulse ring-1 ring-black/5"
        ></div>
      </div>

      <!-- Body -->
      <div class="px-8 lg:px-12 pt-8 pb-4">
        <div class="mx-auto max-w-3xl xl:max-w-4xl animate-pulse space-y-3">
          <div class="h-5 w-11/12 bg-zinc-200 rounded"></div>
          <div class="h-5 w-10/12 bg-zinc-200 rounded"></div>
          <div class="h-5 w-9/12 bg-zinc-200 rounded"></div>
          <div class="h-5 w-8/12 bg-zinc-200 rounded"></div>
        </div>
      </div>

      <!-- Verdict progress + CTA -->
      <div class="px-8 lg:px-12 pb-10">
        <div class="mx-auto max-w-3xl xl:max-w-4xl">
          <!-- badges -->
          <div class="mb-3 grid grid-cols-2 items-center animate-pulse">
            <div class="h-6 w-20 rounded-md bg-zinc-200"></div>
            <div class="h-6 w-20 rounded-md bg-zinc-200 justify-self-end"></div>
          </div>

          <!-- bar -->
          <div class="h-3 rounded-full bg-zinc-200 animate-pulse"></div>

          <!-- numbers -->
          <div class="mt-2 flex justify-between text-xs">
            <div class="h-4 w-28 bg-zinc-200 rounded"></div>
            <div class="h-4 w-28 bg-zinc-200 rounded"></div>
          </div>

          <!-- CTA -->
          <div class="mt-7 flex justify-center animate-pulse">
            <div class="h-11 w-40 rounded-2xl bg-zinc-200"></div>
          </div>
        </div>
      </div>
    </article>

    <!-- Comments skeleton -->
    <section class="mt-10">
      <div class="flex items-center justify-between gap-3 mb-4 animate-pulse">
        <div class="h-7 w-44 bg-zinc-200 rounded"></div>
        <div class="h-9 w-32 bg-zinc-200 rounded-lg"></div>
      </div>

      <ol class="space-y-4">
        <li v-for="n in 3" :key="n" class="bg-white rounded-xl ring-1 ring-black/5 p-4 shadow-sm">
          <div class="flex gap-4">
            <div class="h-12 w-12 rounded-full bg-zinc-200 animate-pulse"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 w-1/4 bg-zinc-200 rounded animate-pulse"></div>
              <div class="h-4 w-2/3 bg-zinc-200 rounded animate-pulse"></div>
              <div class="h-4 w-1/2 bg-zinc-200 rounded animate-pulse"></div>

              <div class="mt-3 grid grid-cols-3 gap-3">
                <div class="h-24 bg-zinc-200 rounded-lg animate-pulse"></div>
                <div class="h-24 bg-zinc-200 rounded-lg animate-pulse"></div>
                <div class="h-24 bg-zinc-200 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        </li>
      </ol>

      <!-- Pagination skeleton -->
      <div class="mt-6 flex items-center justify-center gap-2 animate-pulse">
        <div class="h-9 w-24 bg-zinc-200 rounded-lg"></div>
        <div class="h-9 w-9 bg-zinc-200 rounded-lg"></div>
        <div class="h-9 w-24 bg-zinc-200 rounded-lg"></div>
      </div>
    </section>
  </div>
</template>
